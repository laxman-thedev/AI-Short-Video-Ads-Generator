/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  EllipsisIcon,
  ImageIcon,
  Loader2Icon,
  PlaySquareIcon,
  Share2Icon,
  Trash2Icon,
} from "lucide-react";
import { GhostButton, PrimaryButton } from "./Buttons";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const ProjectCard = ({
  gen,
  setGenerations,
  forCommunity = false,
}: {
  gen: Project;
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
}) => {

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const {getToken} = useAuth()

  const handleDelete = async (id:string) => {
      const confirm = window.confirm('Are you sure you want to delete this project?')
      if (!confirm)  return;
      try {
        const token=await getToken();
        const {data} = await api.delete(`/api/project/${id}`,{
          headers:{Authorization:`Bearer ${token}`}
        })
        setGenerations((generations)=>generations.filter((gen)=>gen.id !== id));
        toast.success(data.message)
      } catch (error:any) {
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
      }  
  }

  const togglePublish = async (projectId:string) => {
      try {
        const token = await getToken();
        const {data}=await api.get(`/api/user/publish/${projectId}`,{
          headers:{Authorization:`Bearer ${token}`}
        })
        setGenerations((generations)=>generations.map((gen)=>gen.id === projectId ? {...gen,isPublished:data.isPublished}:gen));
        toast.success(data.isPublished ? 'Project published':'project unpublished');
      } catch (error:any) {
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
      }  
  }

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group">
        {/* Preview */}
        <div
          className={`${gen?.aspectRatio === "9:16" ? "aspect-[9/16]" : "aspect-video"
            } relative overflow-hidden`}
        >
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${gen.generatedVideo
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105"
                }`}
            />
          )}

          {gen.generatedVideo && (
            <video
              src={gen.generatedVideo}
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}

          {!gen.generatedImage && !gen.generatedVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Loader2Icon className="size-7 animate-spin" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            {gen.isGenerating && (
              <span className="text-xs px-2 py-1 bg-yellow-600/30 rounded-full">
                Generating
              </span>
            )}
            {gen.isPublished && (
              <span className="text-xs px-2 py-1 bg-green-600/30 rounded-full">
                Published
              </span>
            )}
          </div>

          {/* Action menu for my generations only */}
          {!forCommunity && (
            <div
              onMouseDownCapture={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
              className="absolute right-3 top-3 sm:opacity-0 group-hover:opacity-100 transition"
            >
              <EllipsisIcon className="bg-black/20 rounded-full p-1 size-7 cursor-pointer" />

              {menuOpen && (
                <div className="mt-2 w-40 bg-black/70 backdrop-blur text-white border border-gray-500/50 rounded-lg shadow-md py-1">
                  {gen.generatedImage && (
                    <a
                      href={gen.generatedImage}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/30"
                    >
                      <ImageIcon size={14} /> Download Image
                    </a>
                  )}

                  {gen.generatedVideo && (
                    <a
                      href={gen.generatedVideo}
                      download
                      className="flex gap-2 items-center px-4 py-2 hover:bg-black/30"
                    >
                      <PlaySquareIcon size={14} /> Download Video
                    </a>
                  )}

                  {(gen.generatedVideo || gen.generatedImage) && (
                    <button
                      onClick={() =>
                        navigator.share?.({
                          url: gen.generatedVideo || gen.generatedImage,
                          title: gen.productName,
                          text: gen.productDescription,
                        })
                      }
                      className="w-full flex gap-2 items-center px-4 py-2 hover:bg-black/30"
                    >
                      <Share2Icon size={14} /> Share
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(gen.id)}
                    className="w-full flex gap-2 items-center px-4 py-2 hover:bg-red-900/30 text-red-400"
                  >
                    <Trash2Icon size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Source images */}
          {gen.uploadedImages?.length >= 2 && (
            <div className="absolute right-3 bottom-3">
              <img
                src={gen.uploadedImages[0]}
                alt="product"
                className="w-12 h-12 object-cover rounded-full"
              />
              <img
                src={gen.uploadedImages[1]}
                alt="model"
                className="w-12 h-12 object-cover rounded-full ml-6 -mt-4"
              />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">

          {/* Title + Aspect Badge */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-lg leading-tight">
              {gen.productName}
            </h3>

            <span className="text-xs px-2 py-1 bg-white/10 border border-white/10 rounded-full text-gray-300 whitespace-nowrap">
              {gen.aspectRatio}
            </span>
          </div>

          {/* Dates */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>
              Created: {new Date(gen.createdAt).toLocaleString()}
            </p>

            {gen.updatedAt && (
              <p>
                Updated: {new Date(gen.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Description */}
          {gen.productDescription && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-300 bg-white/5 border border-white/10 rounded-md p-2 leading-relaxed">
                {gen.productDescription}
              </p>
            </div>
          )}

          {/* Buttons */}
          {!forCommunity && (
            <div className="pt-2 grid grid-cols-2 gap-3">
              <GhostButton
                className="text-xs justify-center"
                onClick={() => navigate(`/result/${gen.id}`)}
              >
                View Details
              </GhostButton>

              <PrimaryButton
                onClick={() => togglePublish(gen.id)}
                className="rounded-md"
              >
                {gen.isPublished ? "Unpublish" : "Publish"}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;