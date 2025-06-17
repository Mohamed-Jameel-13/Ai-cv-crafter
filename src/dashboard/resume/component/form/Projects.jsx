import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContext, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Brain } from "lucide-react";
import { ResumeContext } from "@/context/ResumeContext";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { toast } from "sonner";
import { AIchatSession } from "../../../../../service/AiModel";

const initialProject = {
  name: "",
  technologies: "",
  description: "",
  bullets: [""],
  liveDemo: ""
};

const prompt = `Given the project name "{projectName}" and technologies "{technologies}", generate a professional project description and 3 key highlights that showcase technical implementation and achievements. Format the response as a JSON object with "description" (brief project overview) and "highlights" (array of 3 bullet points describing key technical achievements).`;

const Projects = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [projectsList, setProjectsList] = useState(() =>
    resumeInfo?.projects?.length > 0 ? resumeInfo.projects : [initialProject]
  );
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(null);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);

  useEffect(() => {
    setResumeInfo(prev => ({
      ...prev,
      projects: projectsList
    }));
  }, [projectsList, setResumeInfo]);

  const handleChange = useCallback((projectIndex, field, value) => {
    setProjectsList(prev => {
      const newProjects = [...prev];
      newProjects[projectIndex][field] = value;
      return newProjects;
    });
  }, []);

  const handleBulletChange = useCallback((projectIndex, bulletIndex, value) => {
    setProjectsList(prev => {
      const newProjects = [...prev];
      newProjects[projectIndex].bullets[bulletIndex] = value;
      return newProjects;
    });
  }, []);

  const generateContent = async (projectIndex) => {
    if (!projectsList[projectIndex].name || !projectsList[projectIndex].technologies) {
      toast.error("Please enter project name and technologies first");
      return;
    }

    setAiLoading(true);
    setCurrentProjectIndex(projectIndex);
    try {
      const PROMPT = prompt
        .replace("{projectName}", projectsList[projectIndex].name)
        .replace("{technologies}", projectsList[projectIndex].technologies);
      
      const result = await AIchatSession.sendMessage(PROMPT);
      const response = await result.response.text();
      const parsedResponse = JSON.parse(response);
      setAiGeneratedContent(parsedResponse);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiContent = useCallback(() => {
    if (aiGeneratedContent && currentProjectIndex !== null) {
      setProjectsList(prev => {
        const newProjects = [...prev];
        newProjects[currentProjectIndex] = {
          ...newProjects[currentProjectIndex],
          description: aiGeneratedContent.description,
          bullets: aiGeneratedContent.highlights
        };
        return newProjects;
      });
      setAiGeneratedContent(null);
      toast.success("AI content applied successfully");
    }
  }, [aiGeneratedContent, currentProjectIndex]);

  const addNewProject = useCallback(() => {
    setProjectsList(prev => [...prev, { ...initialProject }]);
  }, []);

  const removeProject = useCallback(() => {
    if (projectsList.length > 1) {
      setProjectsList(prev => prev.slice(0, -1));
    }
  }, [projectsList.length]);

  const addBulletPoint = useCallback((projectIndex) => {
    setProjectsList(prev => {
      const newProjects = [...prev];
      newProjects[projectIndex].bullets.push("");
      return newProjects;
    });
  }, []);

  const removeBulletPoint = useCallback((projectIndex) => {
    setProjectsList(prev => {
      const newProjects = [...prev];
      if (newProjects[projectIndex].bullets.length > 1) {
        newProjects[projectIndex].bullets.pop();
      }
      return newProjects;
    });
  }, []);

  const onSave = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(db, `usersByEmail/${email}/resumes`, `resume-${resumeId}`);
      await setDoc(resumeRef, { projects: projectsList }, { merge: true });
      toast.success("Projects updated successfully");
      enableNext(true);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to update projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Projects</h2>
        <p>Add your technical projects</p>

        {projectsList.map((project, projectIndex) => (
          <div key={projectIndex} className="border rounded-lg p-3 mt-3">
            <div className="space-y-3">
              <div>
                <label className="text-xs">Project Name</label>
                <Input
                  value={project.name}
                  onChange={(e) => handleChange(projectIndex, "name", e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-xs">Technologies (comma separated)</label>
                <Input
                  value={project.technologies}
                  onChange={(e) => handleChange(projectIndex, "technologies", e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="text-xs">Brief Description</label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary flex gap-2"
                    onClick={() => generateContent(projectIndex)}
                    disabled={aiLoading}
                  >
                    {aiLoading && currentProjectIndex === projectIndex ? 
                      <LoaderCircle className="h-4 w-4 animate-spin" /> : 
                      <Brain className="h-4 w-4" />
                    }
                    Generate from AI
                  </Button>
                </div>
                <Textarea
                  value={project.description}
                  onChange={(e) => handleChange(projectIndex, "description", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs">Live Demo URL</label>
                <Input
                  value={project.liveDemo}
                  onChange={(e) => handleChange(projectIndex, "liveDemo", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs">Project Highlights</label>
                {project.bullets.map((bullet, bulletIndex) => (
                  <Input
                    key={bulletIndex}
                    value={bullet}
                    onChange={(e) => handleBulletChange(projectIndex, bulletIndex, e.target.value)}
                  />
                ))}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addBulletPoint(projectIndex)}
                    className="text-primary text-xs"
                  >
                    + Add Bullet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeBulletPoint(projectIndex)}
                    className="text-primary text-xs"
                  >
                    - Remove Bullet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between mt-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={addNewProject}
              className="text-primary"
            >
              + Add Project
            </Button>
            <Button
              variant="outline"
              onClick={removeProject}
              className="text-primary"
            >
              - Remove Project
            </Button>
          </div>
          <Button disabled={loading} onClick={onSave}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      {aiGeneratedContent && (
        <div className="mt-5 p-5 shadow-lg rounded-lg">
          <h2 className="font-bold text-lg mb-3">AI Generated Content</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Description:</h3>
              <p className="text-sm">{aiGeneratedContent.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Highlights:</h3>
              <ul className="list-disc pl-5">
                {aiGeneratedContent.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm">{highlight}</li>
                ))}
              </ul>
            </div>
            <Button 
              onClick={applyAiContent}
              className="w-full"
            >
              Apply This Content
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
