import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { useEffect } from "react";

const ProjectsPreview = ({ resumeInfo }) => {
  const projects = resumeInfo?.projects;

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return null;
    }
  };

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);

    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    } else if (formattedStart) {
      return formattedStart;
    } else if (formattedEnd) {
      return formattedEnd;
    }
    return null;
  };

  // ------------ ENHANCED DIAGNOSTIC LOG ------------
  useEffect(() => {
    console.log("🕵️ [ProjectsPreview] Complete resumeInfo:", resumeInfo);
    console.log("🕵️ [ProjectsPreview] Projects array:", projects);

    if (projects && Array.isArray(projects)) {
      console.log(`🕵️ [ProjectsPreview] Found ${projects.length} projects`);
      projects.forEach((project, index) => {
        console.log(`🕵️ [ProjectsPreview] Project ${index + 1}:`, {
          name: project?.name,
          title: project?.title,
          description: project?.description,
          bullets: project?.bullets,
          bulletsLength: project?.bullets?.length,
          bulletsType: typeof project?.bullets,
          isArray: Array.isArray(project?.bullets),
          validBullets: project?.bullets?.filter((b) => b && b.trim()),
          technologies: project?.technologies,
          liveDemo: project?.liveDemo,
          githubRepo: project?.githubRepo,
        });

        // Log each bullet individually
        if (project?.bullets && Array.isArray(project.bullets)) {
          project.bullets.forEach((bullet, bIndex) => {
            console.log(
              `  📌 Bullet ${bIndex + 1}: "${bullet}" (length: ${bullet?.length}, trimmed: "${bullet?.trim()}")`,
            );
          });
        }
      });
    } else {
      console.log(
        "🕵️ [ProjectsPreview] No projects found or projects is not an array",
      );
    }
  }, [resumeInfo, projects]);
  // ------------ END: ENHANCED DIAGNOSTIC LOG ------------

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-4">
        No projects data added.
      </div>
    );
  }

  return (
    <div className="my-1">
      <h2 className="text-center font-bold text-sm mb-2">PROJECTS</h2>
      <hr
        className="border-[1.5px] my-2"
        style={{ borderColor: resumeInfo?.themeColor || "rgb(107 114 128)" }}
      />

      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1 sm:gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">
                  {project.name || project.title}
                </h3>

                {/* Project Links - responsive layout */}
                <div className="flex justify-start sm:justify-center items-center gap-2 text-xs">
                  {project.liveDemo && (
                    <a
                      href={project.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-black hover:text-blue-600"
                    >
                      <FaExternalLinkAlt className="text-black" />
                      Live
                    </a>
                  )}
                  {project.githubRepo && (
                    <>
                      {project.liveDemo && <span>|</span>}
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-black hover:text-gray-700"
                      >
                        <FaGithub className="text-black" />
                        Code
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                {formatDateRange(project.startDate, project.endDate) && (
                  <span className="text-xs text-gray-600 order-2 sm:order-1">
                    {formatDateRange(project.startDate, project.endDate)}
                  </span>
                )}
                <span className="text-xs font-semibold text-gray-600 order-1 sm:order-2">
                  {project.technologies}
                </span>
              </div>
            </div>

            {project.description && project.description.trim() && (
              <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Fixed bullet points logic - simplified and more reliable */}
            {project.bullets &&
              Array.isArray(project.bullets) &&
              (() => {
                const validBullets = project.bullets.filter(
                  (bullet) => bullet && bullet.trim(),
                );
                console.log(
                  `🔍 [ProjectsPreview] Project "${project.name || project.title}" - Valid bullets:`,
                  validBullets,
                );
                return validBullets.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {validBullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="text-xs text-gray-700 leading-relaxed"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-orange-500 italic">
                    (No valid bullet points found)
                  </div>
                );
              })()}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPreview;
