import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContext, useEffect, useState, useCallback, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Brain, ExternalLink, Github } from "lucide-react";
import { ResumeContext } from "@/context/ResumeContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { toast } from "sonner";
import { AIchatSession } from "../../../../../service/AiModel";
import { AIButton } from "@/components/ui/ai-button";

const initialProject = {
  name: "",
  technologies: "",
  description: "",
  bullets: [""],
  liveDemo: "",
  githubRepo: "",
  startDate: "",
  endDate: ""
};

const prompt = `You are a professional resume expert specializing in technical project descriptions.

Project Details:
- Project Name: {projectName}
- Technologies Used: {technologies}
- Target Job Title: {jobTitle}

Generate 3 comprehensive project content suggestions that are:
- ATS-friendly and professionally written
- Highlight the specific technologies mentioned: {technologies}
- Demonstrate technical skills, problem-solving, and project impact
- Include quantifiable results where possible (performance improvements, user engagement, etc.)
- Show technical depth appropriate for the job title: {jobTitle}
- Follow best practices for technical project descriptions

Each suggestion should include:
1. A compelling project description (2-3 sentences)
2. 3-4 key highlights/achievements that showcase technical skills and impact

Return as JSON array with fields: "experience_level" (Fresher/Mid-level/Experienced), "description", and "highlights" (array of strings).

Focus heavily on the technologies: {technologies} and ensure they are prominently featured in the descriptions and highlights.

Example format:
[
  {
    "experience_level": "Mid-level",
    "description": "Developed a scalable e-commerce web application using React.js, Node.js, and MongoDB to provide seamless online shopping experience for 10,000+ users.",
    "highlights": [
      "Built responsive frontend using React.js with Redux state management, improving user experience and reducing load times by 40%",
      "Implemented RESTful APIs with Node.js and Express.js, handling 1,000+ concurrent requests with 99.9% uptime",
      "Designed and optimized MongoDB database schema, reducing query response time by 60%",
      "Integrated secure payment gateway and authentication system, processing $500K+ in transactions"
    ]
  }
]`;

const Projects = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  
  // Initialize with context data first, then fallback to default
  const [projectsList, setProjectsList] = useState(() =>
    resumeInfo?.projects?.length > 0 ? resumeInfo.projects : [initialProject]
  );
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(null);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [hasGenerated, setHasGenerated] = useState({});
  const [canRegenerate, setCanRegenerate] = useState({});
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState({});
  const intervalRef = useRef(null);
  
  // Track previous data to prevent unnecessary context updates
  const previousDataRef = useRef(null);
  const hasInitialized = useRef(false);
  const isContextUpdating = useRef(false);

  // Initialize only once
  useEffect(() => {
    if (!hasInitialized.current && resumeInfo?.projects?.length > 0) {
      setProjectsList(resumeInfo.projects);
      previousDataRef.current = JSON.stringify(resumeInfo.projects);
      hasInitialized.current = true;
    } else if (!hasInitialized.current) {
      previousDataRef.current = JSON.stringify([initialProject]);
      hasInitialized.current = true;
    }
  }, [resumeInfo?.projects]);

  // Optimized context update - only when data actually changes
  useEffect(() => {
    if (!hasInitialized.current || isContextUpdating.current) return;
    
    const currentDataString = JSON.stringify(projectsList);
    if (currentDataString !== previousDataRef.current) {
      // Only update if projects data has meaningful content
      if (projectsList && projectsList.length > 0 && projectsList.some(project => project.name?.trim() || project.description?.trim())) {
        isContextUpdating.current = true;
        setResumeInfo(prev => ({
          ...prev,
          projects: projectsList
        }));
        previousDataRef.current = currentDataString;
        
        setTimeout(() => {
          isContextUpdating.current = false;
        }, 100);
      }
    }
  }, [projectsList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(async (projectsData) => {
    // Skip auto-save if in template mode or no resumeId
    if (isTemplateMode || !resumeId) {
      enableNext(true);
      return;
    }
    
    setIsAutoSaving(true);
    try {
      await EncryptedFirebaseService.updateResumeField(email, resumeId, 'projects', projectsData);
      enableNext(true);
    } catch (error) {
      console.error("Error auto-saving encrypted projects:", error);
      toast.error("Auto-save failed. Please check your connection.");
    } finally {
      setIsAutoSaving(false);
    }
  }, [email, resumeId, enableNext, isTemplateMode]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    const timeoutId = setTimeout(() => {
      if (projectsList.length > 0 && projectsList.some(project => project.name?.trim())) {
        autoSave(projectsList);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [projectsList, autoSave]);

  // Cleanup on unmount and save current state
  useEffect(() => {
    return () => {
      // Save current state to context on unmount without causing updates
      if (hasInitialized.current && projectsList.length > 0) {
        isContextUpdating.current = true;
        setResumeInfo((prevInfo) => ({
          ...prevInfo,
          projects: projectsList,
        }));
      }
    };
  }, [projectsList, setResumeInfo]);

  useEffect(() => {
    // Check cooldown status when component mounts
    checkAiGenerationCooldown();
  }, [resumeId, email]);

  useEffect(() => {
    // Update cooldown timers every minute
    const activeProjects = Object.keys(cooldownTimeRemaining).filter(index => 
      !canRegenerate[index] && cooldownTimeRemaining[index] > 0
    );

    if (activeProjects.length > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTimeRemaining(prev => {
          const updated = { ...prev };
          let hasChanges = false;
          
          activeProjects.forEach(index => {
            const newTime = prev[index] - (1/60); // Subtract 1 minute in hours
            if (newTime <= 0) {
              setCanRegenerate(prevCan => ({ ...prevCan, [index]: true }));
              updated[index] = 0;
              hasChanges = true;
            } else {
              updated[index] = newTime;
            }
          });
          
          if (hasChanges && Object.values(updated).every(time => time <= 0)) {
            clearInterval(intervalRef.current);
          }
          
          return updated;
        });
      }, 60000); // Update every minute
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [canRegenerate, cooldownTimeRemaining]);

  const checkAiGenerationCooldown = async () => {
    if (!resumeId || !email || isTemplateMode) return;
    
    try {
      const resumeData = await EncryptedFirebaseService.getResumeData(email, resumeId);
      const newCanRegenerate = {};
      const newCooldownTime = {};
      const newHasGenerated = {};
      
      projectsList.forEach((_, index) => {
        const canRegen = EncryptedFirebaseService.canRegenerateAI(resumeData.aiGenerationTimestamps, 'projects');
        const timeRemaining = EncryptedFirebaseService.getAiCooldownTimeRemaining(resumeData.aiGenerationTimestamps, 'projects');
        
        newCanRegenerate[index] = canRegen;
        newCooldownTime[index] = timeRemaining;
        
        if (resumeData.aiGenerationTimestamps?.projects) {
          newHasGenerated[index] = true;
        }
      });
      
      setCanRegenerate(newCanRegenerate);
      setCooldownTimeRemaining(newCooldownTime);
      setHasGenerated(newHasGenerated);
    } catch (error) {
      console.error('Error checking AI cooldown:', error);
    }
  };

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
    const project = projectsList[projectIndex];
    
    if (!canRegenerate[projectIndex]) {
      toast.error(`AI regeneration available in ${Math.ceil(cooldownTimeRemaining[projectIndex] || 0)} hours`);
      return;
    }

    if (!project.name || !project.technologies) {
      toast.error("Please enter project name and technologies first");
      return;
    }

    setAiLoading(true);
    setCurrentProjectIndex(projectIndex);
    
    try {
      const jobTitle = resumeInfo?.personalDetail?.jobTitle || "software developer";
      const PROMPT = prompt
        .replaceAll("{jobTitle}", jobTitle)
        .replaceAll("{projectName}", project.name)
        .replaceAll("{technologies}", project.technologies);

      const aiResponse = await AIchatSession.sendMessage(PROMPT);
      console.log("AI Response:", aiResponse);
      
      if (!aiResponse) {
        throw new Error("No response from AI service");
      }
      
      // Extract text from response object
      let responseText = aiResponse;
      
      // If aiResponse is an object with response text, extract it
      if (typeof aiResponse === 'object' && aiResponse.response && aiResponse.response.text) {
        responseText = aiResponse.response.text();
      } else if (typeof aiResponse === 'object' && aiResponse.response) {
        responseText = aiResponse.response;
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      setAiGeneratedContent(parsedResponse);
      setHasGenerated(prev => ({ ...prev, [projectIndex]: true }));
      setCanRegenerate(prev => ({ ...prev, [projectIndex]: false }));
      
      // Update AI generation timestamp
      if (resumeId && email) {
        await EncryptedFirebaseService.updateAiGenerationTimestamp(email, resumeId, 'projects');
        setCooldownTimeRemaining(prev => ({ ...prev, [projectIndex]: 24 })); // Set 24-hour cooldown
      }
      
      toast.success("AI suggestions generated successfully!");
      
    } catch (error) {
      console.error("Error generating project content:", error);
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
      toast.success("AI content applied successfully");
    }
  }, [currentProjectIndex]);

  const applyAllAiContent = useCallback(() => {
    if (aiGeneratedContent && currentProjectIndex !== null) {
      // Take the first (usually most comprehensive) suggestion and apply it
      const bestSuggestion = aiGeneratedContent[0];
      
      setProjectsList(prev => {
        const newProjects = [...prev];
        newProjects[currentProjectIndex] = {
          ...newProjects[currentProjectIndex],
          description: bestSuggestion.description,
          bullets: bestSuggestion.highlights
        };
        return newProjects;
      });
      toast.success("AI content applied successfully");
    }
  }, [currentProjectIndex, aiGeneratedContent]);

  const handleRegenerateContent = (projectIndex) => {
    if (!canRegenerate[projectIndex]) {
      toast.error(`AI regeneration available in ${Math.ceil(cooldownTimeRemaining[projectIndex] || 0)} hours`);
      return;
    }
    
    setHasGenerated(prev => ({ ...prev, [projectIndex]: false }));
    setAiGeneratedContent(null);
    generateContent(projectIndex);
  };

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

  const formatCooldownTime = (hours) => {
    if (hours < 1) {
      return `${Math.ceil(hours * 60)} minutes`;
    }
    return `${Math.ceil(hours)} hours`;
  };

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
          <div key={projectIndex} className="border rounded-lg p-3 sm:p-4 mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block">Project Name</label>
                <Input
                  value={project.name}
                  onChange={(e) => handleChange(projectIndex, "name", e.target.value)}
                  className="w-full"
                  placeholder="Enter project name"
                />
              </div>
              
              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block">Technologies (comma separated)</label>
                <Input
                  value={project.technologies}
                  onChange={(e) => handleChange(projectIndex, "technologies", e.target.value)}
                  className="w-full"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block">Start Date <span className="text-xs text-gray-500">(optional)</span></label>
                <Input
                  type="date"
                  value={project.startDate}
                  onChange={(e) => handleChange(projectIndex, "startDate", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block">End Date <span className="text-xs text-gray-500">(optional)</span></label>
                <Input
                  type="date"
                  value={project.endDate}
                  onChange={(e) => handleChange(projectIndex, "endDate", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                  <label className="text-xs sm:text-sm font-medium">Brief Description</label>
                  <AIButton
                    onClick={() => hasGenerated[projectIndex] ? handleRegenerateContent(projectIndex) : generateContent(projectIndex)}
                    loading={aiLoading && currentProjectIndex === projectIndex}
                    loadingText="Creating content..."
                    disabled={(aiLoading && currentProjectIndex === projectIndex) || (!canRegenerate[projectIndex] && hasGenerated[projectIndex])}
                    className={`w-full sm:w-auto text-xs sm:text-sm ${!canRegenerate[projectIndex] && hasGenerated[projectIndex] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      opacity: !canRegenerate[projectIndex] && hasGenerated[projectIndex] ? '0.5' : '1',
                      cursor: !canRegenerate[projectIndex] && hasGenerated[projectIndex] ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {hasGenerated[projectIndex] && !canRegenerate[projectIndex] ? 
                      `Available in ${formatCooldownTime(cooldownTimeRemaining[projectIndex] || 0)}` : 
                      hasGenerated[projectIndex] ? "Regenerate Content" : "Generate Content"}
                  </AIButton>
                </div>
                <Textarea
                  value={project.description}
                  onChange={(e) => handleChange(projectIndex, "description", e.target.value)}
                  className="w-full min-h-[80px]"
                  placeholder="Describe your project and its key features..."
                />
              </div>

              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block flex items-center gap-1">
                  <ExternalLink size={14} className="text-blue-600" />
                  Live Demo URL
                  <span className="text-xs text-gray-500">(will show as "Live" link)</span>
                </label>
                <Input
                  value={project.liveDemo}
                  onChange={(e) => handleChange(projectIndex, "liveDemo", e.target.value)}
                  className="w-full"
                  placeholder="https://your-project-demo.com"
                />
              </div>

              <div className="w-full">
                <label className="text-xs sm:text-sm font-medium mb-1 block flex items-center gap-1">
                  <Github size={14} className="text-gray-700" />
                  GitHub Repository
                  <span className="text-xs text-gray-500">(will show as "Code" link)</span>
                </label>
                <Input
                  value={project.githubRepo}
                  onChange={(e) => handleChange(projectIndex, "githubRepo", e.target.value)}
                  className="w-full"
                  placeholder="https://github.com/username/repository"
                />
              </div>

              <div className="col-span-1 lg:col-span-2 space-y-2">
                <label className="text-xs sm:text-sm font-medium block">Project Highlights</label>
                {project.bullets.map((bullet, bulletIndex) => (
                  <Input
                    key={bulletIndex}
                    value={bullet}
                    onChange={(e) => handleBulletChange(projectIndex, bulletIndex, e.target.value)}
                    className="w-full"
                    placeholder={`Highlight ${bulletIndex + 1}: e.g., Improved performance by 40%`}
                  />
                ))}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => addBulletPoint(projectIndex)}
                    className="text-primary hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm w-full sm:w-auto"
                  >
                    + Add Bullet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => removeBulletPoint(projectIndex)}
                    className="text-primary hover:bg-primary hover:text-white transition-colors text-xs sm:text-sm w-full sm:w-auto"
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
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            + Add Project
          </Button>
          <Button
            variant="outline"
            onClick={removeProject}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            - Remove Project
          </Button>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {aiGeneratedContent && currentProjectIndex !== null && (
        <div className="mt-6 w-full">
          <div className="p-3 sm:p-4 lg:p-5 shadow-lg rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">AI Project Suggestions</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={applyAllAiContent}
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm sm:text-xs w-full sm:w-auto"
                >
                  Apply Best
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiGeneratedContent(null)}
                  className="text-gray-600 hover:text-gray-800 text-sm sm:text-xs w-full sm:w-auto"
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {aiGeneratedContent.map((suggestion, index) => (
                <div
                  key={index}
                  className="group p-3 sm:p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg hover:border-[rgb(63,39,34)] transition-all duration-300 sm:transform sm:hover:scale-[1.02]"
                  onClick={() => applyAiContent(suggestion)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full">
                      {suggestion.experience_level}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-violet-600 font-medium">Click to apply</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Description:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed break-words">{suggestion.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Highlights:</h4>
                      <ul className="space-y-1.5">
                        {suggestion.highlights.map((highlight, hIndex) => (
                          <li key={hIndex} className="text-sm text-gray-700 leading-relaxed break-words flex items-start">
                            <span className="text-violet-500 mr-2 mt-1.5 flex-shrink-0">•</span>
                            <span className="flex-1">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center text-xs text-violet-600 font-medium">
                      Use this content
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Projects);
