/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  ImageIcon,
  Loader2Icon,
  RefreshCwIcon,
  SparkleIcon,
  VideoIcon,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GhostButton, PrimaryButton } from "../components/Buttons";
import type { Project } from "../types";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../configs/axios";
import toast from "react-hot-toast";

const Result = () => {
  const { projectId } = useParams();
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  const [project, setProjectData] = useState<Project>({} as Project);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchProjectData = async () => {
    try {
      const token = await getToken()
      const { data } = await api.get(`/api/user/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjectData(data.project)
      setIsGenerating(data.project.isGenerating)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  }

  const handleGenerateVideo = async () => {
    setIsGenerating(true)
    try {
      const token = await getToken();
      const { data } = await api.post('api/project/video', { projectId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProjectData(prev => ({ ...prev, generatedVideo: data.videoUrl, isGenerating: false }))
      toast.success(data.message);
      setIsGenerating(false);

    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  }
  useEffect(() => {
    if (user && !project.id) {
      fetchProjectData();
    } else if (isLoaded && !user) {
      navigate('/');
    }
  }, [user]);

  //fetch project every10 seconds

  useEffect(() => {
    if (user && isGenerating) {
      const interval = setInterval(() => {
        fetchProjectData()
      }, 10000);
      return () => clearInterval(interval)
    }
  }, [user, isGenerating])

  return loading ? (
    <div className="h-screen w-full items-center justify-center" >
      <Loader2Icon className="animate-spin text-indigo size-9" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 mt-20" >
      <div className="max-w-6xl mx-auto" >
        <header className="flex justify-between items-center mb-8 " >
          <h1 className="text-2xl md:text-3xl font-medium" >Generation Result</h1>
          <Link to="/generate" className="btn-secondary text-sm flex items-center gap-2" >
            <RefreshCwIcon className="w-4 h-4" />
            <p className="max-sm:hidden" >New Generation</p>
          </Link>
        </header>

        {/*grid layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/*main result diplay*/}
          <div className="lg:col-span-2 space-y-6" >
            <div className="glass-panel inline-block p-2 rounded-2xl">
              <div className={`${project?.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-video'}
              sm:max-h-200 rounded-xl bg-gray-900 overflow-hidden relative `} >
                {project?.generatedVideo ? (
                  <video src={project.generatedVideo} controls autoPlay loop
                    className="w-full h-full object-cover" />
                ) : (
                  <img src={project.generatedImage} alt="Generated Result"
                    className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>

          {/*sidebar actions */}
          <div className="space-y-6" >
            {/*download buttons*/}
            <div className="glass-panel p-6 rounded-2xl" >
              <h3 className="text-xl font-semibold mb-4" >Actions</h3>
              <div className="flex flex-col gap-3" >
                <a href={project.generatedImage} download >
                  <GhostButton disabled={!project.generatedImage} className="w-full justify-center rounded-md py-3
                      disabled:opacity-50 disabled:cursor-not-allowed" >
                    <ImageIcon className="size-4.5" />
                    Download Image
                  </GhostButton>
                </a>
                <a href={project.generatedVideo} download >
                  <GhostButton disabled={!project.generatedVideo} className="w-full justify-center rounded-md py-3
                    disabled:opacity-50 disabled:cursor-not-allowed" >
                    <VideoIcon className="size-4.5" />
                    Download Video
                  </GhostButton>
                </a>
              </div>
            </div>

            {/*generate video buttons */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10" >
                <VideoIcon className="size-24" />
              </div>
              <h3 className="text-xl font-semibold mb-2" >Video Magic</h3>
              <p className="text-gray-400 text-sm mb-6" >Turn this static image into a dynamic video for social media.</p>
              {!project.generatedVideo ? (
                <PrimaryButton onClick={handleGenerateVideo} disabled={isGenerating} className="w-full" >
                  {isGenerating ? (
                    <>Generating Video...</>
                  ) : (
                    <><SparkleIcon className="size-4" />Generate Video</>
                  )}

                </PrimaryButton>
              ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20
            rounded-xl text-green-400 text-center text-sm font-medium">video Genearted Successfully</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Result;