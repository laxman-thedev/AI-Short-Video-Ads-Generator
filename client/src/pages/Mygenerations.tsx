import { useState, useEffect } from "react";
import type { Project } from "../types";
import { dummyGenerations } from "../assets/assets";
import { Loader2Icon } from "lucide-react";
import { PrimaryButton } from "../components/Buttons";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";

const MyGenerations = () => {
  const navigate = useNavigate();

  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Frontend-only fetch (mock data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGenerations(dummyGenerations);
      setLoading(false);
    }, 1000); // short delay for demo

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="size-7 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            My Generations
          </h1>
          <p className="text-gray-400">
            View and manage your AI-generated content
          </p>
        </header>

        {/* Generations Grid */}
        {generations.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {generations.map((gen) => (
              <ProjectCard
                key={gen.id}
                gen={gen}
                setGenerations={setGenerations}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-medium mb-2">
              No generations yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start creating stunning product photos today
            </p>
            <PrimaryButton onClick={() => navigate("/generate")}>
              Create New Generation
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGenerations;