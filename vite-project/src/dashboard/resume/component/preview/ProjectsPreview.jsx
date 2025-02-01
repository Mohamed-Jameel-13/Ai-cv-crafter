import { Link } from "lucide-react";

const ProjectsPreview = ({ resumeInfo }) => {
  const projects = resumeInfo?.projects;

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-4">
        No projects data added.
      </div>
    );
  }

  return (
    <div className="my-1">
      <h2 className="text-center font-bold text-sm mb-2">Projects</h2>
      <hr className="border-[1.5px] my-2" style={{borderColor: resumeInfo?.themeColor || "rgb(107 114 128)"}} />
      
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-sm">
                {project.name}
                {project.liveDemo && (
                  <a href={project.liveDemo} target="_blank" rel="noopener noreferrer" className="ml-2 italic text-slate-700">
                    <Link size={12} className="inline" /> Live Demo
                  </a>
                )}
              </h3>
              <span className="text-xs font-semibold">{project.technologies}</span>
            </div>
            <p className="mt-1 text-xs italic mb-2">{project.description}</p>
            <ul className="list-disc pl-5 space-y-1">
              {project.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex} className="text-xs">
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPreview;
