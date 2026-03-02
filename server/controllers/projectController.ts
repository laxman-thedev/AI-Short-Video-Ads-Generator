import { Request, Response } from "express"
import * as Sentry from "@sentry/node"
import { prisma } from "../configs/prisma.js";
import { v2 as cloudinary } from 'cloudinary'
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import fs from 'fs';
import path from "path";
import ai from "../configs/ai.js";
import axios from "axios";
import { checkAndResetDailyCredits } from "../middlewares/dailyCredits.js";
import os from "os";

const loadImage = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString('base64'),
      mimeType
    }
  }
}

export const createProject = async (req: Request, res: Response) => {

  let tempProjectId: string;
  const { userId } = req.auth();
  let isCreditDeducted = false;
  const COST = 5;

  const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body;

  const images: any = req.files;

  if (images.length < 2 || !productName) {
    return res.status(400).json({ message: 'please upload at least 2 images' })
  }

  const user = await checkAndResetDailyCredits(userId);

  if (!user || user.credits < COST || user.dailyCredits < COST) {
    return res.status(401).json({
      message: "Not enough credits or daily limit reached"
    });
  }
  else {
    //deduct credits for image generation
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: COST },
        dailyCredits: { decrement: COST }
      }
    }).then(() => { isCreditDeducted = true })
  }

  try {
    let uploadedImages = await Promise.all(
      images.map(async (item: any) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url
      })
    )

    const project = await prisma.project.create({
      data: {
        name,
        userId,
        productName,
        productDescription,
        userPrompt,
        aspectRatio,
        targetLength: parseInt(targetLength),
        uploadedImages,
        isGenerating: true
      }
    })

    tempProjectId = project.id;

    const model = "gemini-2.5-flash-image";
    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: aspectRatio || '9:16',
        imageSize: '1K'
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        }
      ]
    };

    //image to base64 structure for ai model
    const img1base64 = loadImage(images[0].path, images[0].mimetype);
    const img2base64 = loadImage(images[1].path, images[1].mimetype);
    const prompt = {
      text: `
        Generate a premium commercial advertisement photo.

        Combine the uploaded model and product naturally.
        The model should confidently showcase the product in a believable pose.
          Ensure:
          - Correct scale and proportions
          - Natural finger placement
          - Realistic grip interaction
          - Accurate shadow alignment
          - Consistent light direction
          - Proper perspective matching

          Lighting setup:
          Soft studio key light, balanced fill light, subtle rim light to separate subject from background.
          Add realistic contact shadows under feet and product.

          Camera:
          Shot on professional DSLR, 85mm lens, shallow depth of field.
          Cinematic color grading, balanced contrast, natural skin texture.

        Product must remain sharp, clear, and visually dominant.
        No distortions, no extra limbs, no blur on main subject.

        Style: high-end ecommerce advertisement, photorealistic, ultra detailed, commercial ready.

      ${userPrompt}
  `
    };

    const response: any = await ai.models.generateContent({
      model,
      contents: [img1base64, img2base64, prompt],
      config: generationConfig
    });

    if (!response?.candidates?.[0]?.content?.parts) {
      throw new Error('Unexpected response');
    }

    const parts = response?.candidates?.[0]?.content?.parts || [];

    let finalBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineData?.data) {
        finalBuffer = Buffer.from(part.inlineData.data, "base64");
        break;
      }
    }

    if (!finalBuffer) {
      console.error("Gemini response:", JSON.stringify(response, null, 2));
      throw new Error("Failed to generate image - no inlineData returned");
    }

    const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
    });

    await prisma.project.update({
      where: { id: project.id },
      data: {
        generatedImage: uploadResult.secure_url,
        isGenerating: false
      }
    });

    res.json({ projectId: project.id });
  } catch (error: any) {
    console.error('[createProject] ✗ Error:', error.message);
    console.error('[createProject] ✗ Full error:', error?.response?.data || error);
    if (tempProjectId!) {
      //update project status and error message
      await prisma.project.update({
        where: { id: tempProjectId },
        data: { isGenerating: false, error: error.message }
      })
    }
    if (isCreditDeducted) {
      //add credits back
      await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: 5 }, dailyCredits: { increment: COST } }
      })
    }

    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
}

export const createVideo = async (req: Request, res: Response) => {
  const { userId } = req.auth();
  const { projectId } = req.body;
  const COST = 10;

  let isCreditDeducted = false;

  try {
    // Check & reset daily credits
    const user = await checkAndResetDailyCredits(userId);

    if (!user || user.credits < COST || user.dailyCredits < COST) {
      return res.status(401).json({
        message: "Not enough credits or daily limit reached"
      });
    }

    // Validate project first
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId }
    });

    if (!project || project.isGenerating) {
      return res.status(404).json({ message: "Generation in progress or project not found" });
    }

    if (project.generatedVideo) {
      return res.status(400).json({ message: "Video already generated" });
    }

    if (!project.generatedImage) {
      return res.status(400).json({ message: "Generated image not found" });
    }

    // Deduct credits only after validation
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: COST },
        dailyCredits: { decrement: COST }
      }
    });

    isCreditDeducted = true;

    // Mark generating
    await prisma.project.update({
      where: { id: projectId },
      data: { isGenerating: true }
    });

    const prompt = `
      Create a realistic short promotional video advertisement.

      The person should naturally and confidently showcase the product: ${project.productName}.
      ${project.productDescription || ""}

      The person should interact with the product in a believable way (holding, demonstrating, using, or presenting it).

      Video style:
      - UGC-style but high quality
      - Looks like filmed on a modern smartphone
      - Vertical 9:16 format
      - Natural movements and expressions
      - Authentic and engaging

      Camera:
      - Smooth handheld motion or slight cinematic movement
      - Medium close-up transitioning to product focus
      - Subtle depth of field

      Lighting:
      - Natural soft lighting
      - Consistent shadows
      - Professional commercial look

      Make the product clearly visible and sharp.
      Ensure realistic hand movement, no distortions, no unnatural body motion.

      Mood: energetic, modern, social-media ready.
      Style: high-quality ecommerce promotional ad.

      Duration: short, engaging, scroll-stopping.
      `;

    const model = "veo-3.1-generate-preview";

    const image = await axios.get(project.generatedImage, {
      responseType: "arraybuffer"
    });

    const imageBytes = Buffer.from(image.data);

    let operation: any = await ai.models.generateVideos({
      model,
      prompt,
      image: {
        imageBytes: imageBytes.toString("base64"),
        mimeType: "image/png"
      },
      config: {
        aspectRatio: project.aspectRatio || "9:16",
        numberOfVideos: 1,
        resolution: "720p"
      }
    });

    // Poll
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    // Safe checks
    if (operation.error) {
      throw new Error(operation.error.message || "Video generation failed");
    }

    if (!operation.response?.generatedVideos?.length) {
      console.error("Gemini operation:", operation);
      throw new Error("Video generation failed - no output");
    }

    const videoFile = operation.response.generatedVideos[0].video;

    // Temp path for Vercel
    const filename = `${userId}-${Date.now()}.mp4`;
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);

    // Download
    await ai.files.download({
      file: videoFile,
      downloadPath: filePath
    });

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video"
    });

    // Update DB
    await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedVideo: uploadResult.secure_url,
        isGenerating: false
      }
    });

    fs.unlinkSync(filePath);

    res.json({
      message: "Video generation completed",
      videoUrl: uploadResult.secure_url
    });

  } catch (error: any) {
    console.error("[createVideo] Error:", error.message);

    await prisma.project.update({
      where: { id: projectId },
      data: { isGenerating: false, error: error.message }
    });

    // Refund credits
    if (isCreditDeducted) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: COST },
          dailyCredits: { increment: COST }
        }
      });
    }

    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllPublishedProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true }
    })
    res.json({ projects })
  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
}

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { userId } = req.auth();
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId }
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found ' })
    }

    await prisma.project.delete({
      where: { id: projectId }
    })

    res.json({ message: 'Project deleted' });

  } catch (error: any) {
    Sentry.captureException(error);
    res.status(500).json({ message: error.message });
  }
}
