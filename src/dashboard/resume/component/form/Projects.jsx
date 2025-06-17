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

const prompt = `Given the project name "{projectName}" and technologies "{technologies}", provide three different project suggestion levels for a resume. Each suggestion should be in JSON format with fields "experience_level" (values can be "Entry-level", "Mid-level", "Senior-level"), "description" (brief ATS-friendly project overview), and "highlights" (array of 4-5 ATS-friendly bullet points focusing on technical achievements, impact, and skills demonstrated). Output an array of JSON objects. Format: [{"experience_level": "Entry-level", "description": "Brief description", "highlights": ["Achievement 1", "Achievement 2", ...]}, ...]`;

const Projects = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [projectsList, setProjectsList] = useState(() =>
    resumeInfo?.projects?.length > 0 ? resumeInfo.projects : [initialProject]
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(null);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);

  useEffect(() => {
    setResumeInfo(prev => ({
      ...prev,
      projects: projectsList
    }));
  }, [projectsList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(async (data) => {
    setIsAutoSaving(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(db, `usersByEmail/${email}/resumes`, `resume-${resumeId}`);
      await setDoc(resumeRef, { projects: data }, { merge: true });
      enableNext(true);
    } catch (error) {
      console.error("Error auto-saving to Firestore:", error);
      toast.error("Auto-save failed. Please check your connection.");
    } finally {
      setIsAutoSaving(false);
    }
  }, [email, resumeId, enableNext]);

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectsList.length > 0 && projectsList[0].name) {
        autoSave(projectsList);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [projectsList, autoSave]);

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
      
      console.log("Prompt:", PROMPT);
      
      // Call AI service - it returns text directly
      const aiResponse = await AIchatSession.sendMessage(PROMPT);
      console.log("AI Response:", aiResponse);
      
      if (!aiResponse) {
        throw new Error("No response from AI service");
      }
      
      // Parse the response as JSON
      let parsedResponse;
      try {
        // Try to parse the response directly
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      // Validate the parsed response
      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      setAiGeneratedContent(parsedResponse);
      toast.success("AI suggestions generated successfully!");
      
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate AI suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiContent = useCallback((selectedSuggestion) => {
    if (selectedSuggestion && currentProjectIndex !== null) {
      setProjectsList(prev => {
        const newProjects = [...prev];
        newProjects[currentProjectIndex] = {
          ...newProjects[currentProjectIndex],
          description: selectedSuggestion.description,
          bullets: selectedSuggestion.highlights
        };
        return newProjects;
      });
      setAiGeneratedContent(null);
      toast.success("AI content applied successfully");
    }
  }, [currentProjectIndex]);

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

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Projects</h2>
            <p className="text-sm sm:text-base text-gray-600">Add your technical projects</p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
        </div>

        {projectsList.map((project, projectIndex) => (
          <div key={projectIndex} className="border rounded-lg p-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="w-full">
                <label className="text-xs font-medium">Project Name</label>
                <Input
                  value={project.name}
                  onChange={(e) => handleChange(projectIndex, "name", e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="w-full">
                <label className="text-xs font-medium">Technologies (comma separated)</label>
                <Input
                  value={project.technologies}
                  onChange={(e) => handleChange(projectIndex, "technologies", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                  <label className="text-xs font-medium">Brief Description</label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white transition-colors flex gap-2 w-full sm:w-auto"
                    onClick={() => generateContent(projectIndex)}
                    disabled={aiLoading}
                  >
                    {aiLoading && currentProjectIndex === projectIndex ? 
                      <LoaderCircle className="h-4 w-4 animate-spin" /> : 
                      <Brain className="h-4 w-4" />
                    }
                    {aiLoading && currentProjectIndex === projectIndex ? "Generating..." : "Generate from AI"}
                  </Button>
                </div>
                <Textarea
                  value={project.description}
                  onChange={(e) => handleChange(projectIndex, "description", e.target.value)}
                  className="w-full min-h-[80px]"
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-medium">Live Demo URL</label>
                <Input
                  value={project.liveDemo}
                  onChange={(e) => handleChange(projectIndex, "liveDemo", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-medium">Project Highlights</label>
                {project.bullets.map((bullet, bulletIndex) => (
                  <Input
                    key={bulletIndex}
                    value={bullet}
                    onChange={(e) => handleBulletChange(projectIndex, bulletIndex, e.target.value)}
                    className="w-full"
                  />
                ))}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => addBulletPoint(projectIndex)}
                    className="text-primary hover:bg-primary hover:text-white transition-colors text-xs w-full sm:w-auto"
                  >
                    + Add Bullet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeBulletPoint(projectIndex)}
                    className="text-primary hover:bg-primary hover:text-white transition-colors text-xs w-full sm:w-auto"
                  >
                    - Remove Bullet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            variant="outline"
            onClick={addNewProject}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            + Add Project
          </Button>
          <Button
            variant="outline"
            onClick={removeProject}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            - Remove Project
          </Button>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {aiGeneratedContent && (
        <div className="mt-5 w-full">
          <h2 className="font-bold text-base sm:text-lg mb-3">AI Suggestions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {aiGeneratedContent.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 shadow-md rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-lg transition-all duration-200 border border-gray-200 w-full"
                onClick={() => applyAiContent(suggestion)}
              >
                <h3 className="font-bold my-1 text-primary text-sm sm:text-base">
                  Level: <span className="text-red-500">{suggestion.experience_level}</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm">Description:</h4>
                    <p className="text-xs sm:text-sm text-gray-700">{suggestion.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm">Highlights:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                      {suggestion.highlights.map((highlight, hIndex) => (
                        <li key={hIndex} className="text-gray-700 leading-relaxed">{highlight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Click to use this suggestion
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
