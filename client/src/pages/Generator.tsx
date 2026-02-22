import { useState } from "react";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import {
  Loader2Icon,
  RectangleHorizontalIcon,
  RectangleVerticalIcon,
  Wand2Icon,
} from "lucide-react";
import { PrimaryButton } from "../components/Buttons";

const Generator = () => {

  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "product") setProductImage(e.target.files[0]);
      else setModelImage(e.target.files[0]);
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!productImage || !modelImage || !name || !productName || !aspectRatio) {
      setError("Please fill all required fields");
      return;
    }
    else{
      setIsGenerating(true);
      // Simulate generation process
      setTimeout(() => {
        setIsGenerating(false);
        alert("Image generated successfully! (This is a simulation.)");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create In-Context Image"
          description="Upload your model and product images to generate stunning UGC, short-form videos and social media posts"
        />

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          {/* Left Column */}
          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone
              label="Product Image"
              file={productImage}
              onClear={() => setProductImage(null)}
              onChange={(e) => handleFileChange(e, "product")}
            />
            <UploadZone
              label="Model Image"
              file={modelImage}
              onClear={() => setModelImage(null)}
              onChange={(e) => handleFileChange(e, "model")}
            />
          </div>

          {/* Right Column */}
          <div className="w-full">
            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none"
                placeholder="Name your project"
              />
            </div>

            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none"
                placeholder="Enter product name"
              />
            </div>

            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Product Description <span className="text-purple-400 text-xs">(optional)</span></label>
              <textarea
                rows={4}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none"
                placeholder="Describe your product"
              />
            </div>

            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">Aspect Ratio</label>
              <div className="flex gap-3">
                <RectangleVerticalIcon
                  onClick={() => setAspectRatio("9:16")}
                  className={`p-2.5 size-13 bg-white/6 rounded cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "ring-2 ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />
                <RectangleHorizontalIcon
                  onClick={() => setAspectRatio("16:9")}
                  className={`p-2.5 size-13 bg-white/6 rounded cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "ring-2 ring-violet-500/50 bg-white/10"
                      : ""
                  }`}
                />
              </div>
            </div>

            <div className="mb-4 text-gray-300">
              <label className="block text-sm mb-4">User Prompt <span className="text-purple-400 text-xs">(optional)</span></label>
              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full bg-white/3 rounded-lg border-2 p-4 text-sm border-violet-200/10 focus:border-violet-500/50 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <PrimaryButton disabled={isGenerating} className="px-10 py-3">
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="size-5 animate-spin" />
                Generating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wand2Icon className="size-5" />
                Generate Image
              </div>
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default Generator;