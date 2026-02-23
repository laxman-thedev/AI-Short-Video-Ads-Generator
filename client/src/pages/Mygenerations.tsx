/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from '../configs/axios'
import toast from "react-hot-toast"

const MyGeneration = () => {

  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true)

  const fetchMyGenerations = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get('/api/user/projects', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGenerations(data.projects)
      setLoading(false)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      console.log(error);
    }
  }

  useEffect(() => {
    if (user) {
      fetchMyGenerations()
    } else if (isLoaded && !user) {
      navigate('/')
    }
  }, [user])
  return loading ? (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2Icon className="size-7 animate-spin text-indigo-400" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">My Generations</h1>
          <p className="text-gray-400">View and manage your AI-generated content</p>
        </header>

        {/*generations list */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map((gen) => (
            <ProjectCard key={gen.id} gen={gen} setGenerations={setGenerations} />
          ))}
        </div>

        {generations.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10" >
            <h3 className="text-xl font-medium mb-2" >No generations yet</h3>
            <p className="text-gray-400 mb-6" >start creating stunning product photos today</p>
            <PrimaryButton onClick={() => window.location.href = '/generate'}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGeneration
