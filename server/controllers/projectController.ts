/**
 * Project Controller
 * 
 * Core business logic for AI generation workflows in UGC Flow.
 * Handles:
 * - Image generation using Google Gemini Flash Image model.
 * - Video generation using Google Veo AI.
 * - Project lifecycle management (create, delete, fetch).
 * - Multi-stage credit deduction and refund logic.
 * - Asset management with Cloudinary.
 * 
 * Request Flow (Generation):
 * 1. Validate user credits (Cost: 5 for Image, 10 for Video).
 * 2. Upload source images to Cloudinary.
 * 3. Invoke AI models with specialized prompts.
 * 4. Poll for long-running generation tasks (Video).
 * 5. Store generated assets and update project state.
 */
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

/**
 * Helper to convert local files to the base64 format required by Google AI SDK.
 * Used for providing input images to the Gemini model.
 */
const loadImage = (path: string, mimeType: string) => {
  return {
    inlineData: {
      data: fs.readFileSync(path).toString('base64'),
      mimeType
    }
  }
}

/**
 * Create a new generation project and trigger AI image generation.
 * 
 * Process:
 * 1. Validate credits (5 credits required).
 * 2. Deduct credits from user's lifetime and daily balance.
 * 3. Upload raw user images to Cloudinary for reference.
 * 4. Construct AI prompt combining product details and user input.
 * 5. Call Gemini AI Image model.
 * 6. Upload generated image to Cloudinary.
 * 7. Update project with final asset URL.
 * 8. Refund credits if generation fails at any step.
 */
export const createProject = async (req: Request, res: Response) => {

  let tempProjectId: string;
  const { userId } = req.auth();
  let isCreditDeducted = false;
  const COST = 5;

  const { name = "New Project", aspectRatio, userPrompt, productName, productDescription, targetLength = 5 } = req.body;

  const images: any = req.files;

  // Requirement: User must provide at least two source images (e.g., product + person)
  if (images.length < 2 || !productName) {
    return res.status(400).json({ message: 'please upload at least 2 images' })
  }

  // Check if user has sufficient credits and daily limit isn't reached
  const user = await checkAndResetDailyCredits(userId);

  if (!user || user.credits < COST || user.dailyCredits < COST) {
    return res.status(401).json({
      message: "Not enough credits or daily limit reached"
    });
  }
  else {
    // Deduct credits upfront before starting expensive AI generation
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: COST },
        dailyCredits: { decrement: COST }
      }
    }).then(() => { isCreditDeducted = true })
  }

  try {
    // Stage 1: Upload source images to Cloudinary
    let uploadedImages = await Promise.all(
      images.map(async (item: any) => {
        let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url
      })
    )

    // Stage 2: Create initial project record in database
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

    // Stage 3: AI Image Generation with Gemini
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

    // Construct the AI prompt logic
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

    // Execute generation
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

    // Handle the resulting image part
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

    // Stage 4: Upload generated asset to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      resource_type: 'image',
    });

    // Finalize project state in database
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
    // Transactional Safety: Refund credits if the AI fails to produce an image
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

/**
 * Generate a promotional video from a previously generated project image.
 * 
 * Process:
 * 1. Validate project ownership and status.
 * 2. Deduct credits (10 credits required).
 * 3. Fetch the generated image and convert to bytes.
 * 4. Trigger Veo AI video generation.
 * 5. Poll the operation until completion (asynchronous task).
 * 6. Download the resulting video to local temporary storage.
 * 7. Upload final video to Cloudinary.
 * 8. Cleanup local files and update database.
 */
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

    // Ensure the project exists and is ready for video generation
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

    // Update credits and mark as generating
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: COST },
        dailyCredits: { decrement: COST }
      }
    });

    isCreditDeducted = true;

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

    // Prepare image for Veo model
    const image = await axios.get(project.generatedImage, {
      responseType: "arraybuffer"
    });

    const imageBytes = Buffer.from(image.data);

    // Call Video Generation API
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

    // AI Polling Logic: Video generation is long-running
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

    // Temporary storage handling for Cloudinary upload
    const filename = `${userId}-${Date.now()}.mp4`;
    const tempDir = os.tmpdir();
    const filePath = path.join(tempDir, filename);

    // Download generated video from AI provider
    await ai.files.download({
      file: videoFile,
      downloadPath: filePath
    });

    // Upload to permanent storage
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "video"
    });

    // Final database update
    await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedVideo: uploadResult.secure_url,
        isGenerating: false
      }
    });

    // Cleanup temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

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

    // Refund credits on failure
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

/**
 * Fetch all projects that have been marked as public.
 * Used for the community gallery showcase.
 */
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

/**
 * Permanently delete a project and its associated metadata.
 * Requires project ownership.
 */
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
