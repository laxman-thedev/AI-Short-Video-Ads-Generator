import { useEffect, useState } from "react";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import { dummyGenerations } from "../assets/assets";
import ProjectCard from "../components/ProjectCard";

const Community = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      // Only show published projects
      const published = dummyGenerations.filter(
        (project) => project.isPublished
      );
      setProjects(published);
      setLoading(false);
    }, 2000);

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
            Community
          </h1>
          <p className="text-gray-400">
            See what others are creating with UGC.ai
          </p>
        </header>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                gen={project}
                setGenerations={setProjects}
                forCommunity={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-xl font-medium mb-2">
              No published projects yet
            </h3>
            <p className="text-gray-400">
              Be the first to publish your generation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;