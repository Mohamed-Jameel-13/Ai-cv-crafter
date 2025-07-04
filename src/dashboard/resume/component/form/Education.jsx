import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { ResumeContext } from "@/context/ResumeContext";
import { toast } from "sonner";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { AIButton } from "@/components/ui/ai-button";
import { AIchatSession } from "../../../../../service/AiModel";
import { Brain } from "lucide-react";

const formField = {
  school: "",
  degree: "",
  city: "",
  state: "",
  fieldOfStudy: "",
  graduationDate: "",
  description: "",
};

const prompt = `You are a professional resume expert specializing in education descriptions.

Education Details:
- School/University: {school}
- Degree: {degree}
- Field of Study: {fieldOfStudy}
- Graduation Date: {graduationDate}

Generate 3 comprehensive education descriptions that are:
- ATS-friendly and professionally written
- Highlight relevant coursework, academic achievements, projects, or activities
- Demonstrate skills and knowledge relevant to the field of study
- Include honors, GPA (if strong), leadership roles, or significant projects
- Tailored for different experience levels (Recent Graduate, Mid-Career, Experienced Professional)

Each description should be 2-4 lines and focus on value-adding activities during education.

Return as JSON array with fields: "experience_level" (Recent Graduate/Mid-Career/Experienced Professional), "description".

Example format:
[
  {
    "experience_level": "Recent Graduate",
    "description": "Completed comprehensive coursework in Data Structures, Algorithms, and Software Engineering. Led team of 4 students in capstone project developing full-stack web application using React and Node.js, achieving highest project grade in class."
  }
]`;

const Education = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [educationList, setEducationList] = useState(() =>
    resumeInfo?.education?.length > 0 ? resumeInfo.education : [formField],
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentEducationIndex, setCurrentEducationIndex] = useState(null);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [hasGenerated, setHasGenerated] = useState({});
  const [canRegenerate, setCanRegenerate] = useState({});
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState({});
  const intervalRef = useRef(null);

  // Update context whenever educationList changes
  useEffect(() => {
    setResumeInfo((prev) => ({
      ...prev,
      education: educationList,
    }));
  }, [educationList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(
    async (educationData) => {
      // Skip auto-save if in template mode or no resumeId
      if (isTemplateMode || !resumeId) {
        enableNext(true);
        return;
      }

      setIsAutoSaving(true);
      try {
        await EncryptedFirebaseService.updateResumeField(
          email,
          resumeId,
          "education",
          educationData,
        );
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving encrypted education:", error);
        toast.error("Auto-save failed. Please check your connection.");
      } finally {
        setIsAutoSaving(false);
      }
    },
    [email, resumeId, enableNext, isTemplateMode],
  );

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (educationList.length > 0 && educationList[0].school) {
        autoSave(educationList);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [educationList, autoSave]);

  const handleChange = useCallback((index, event) => {
    const { name, value } = event.target;
    setEducationList((prev) => {
      const newEntries = [...prev];
      newEntries[index][name] = value;
      return newEntries;
    });
  }, []);

  const addNewEducation = useCallback(() => {
    setEducationList((prev) => [...prev, { ...formField }]);
  }, []);

  const removeEducation = useCallback(() => {
    if (educationList.length > 1) {
      setEducationList((prev) => prev.slice(0, -1));
    }
  }, [educationList.length]);

  const handleTextareaChange = useCallback((index, value) => {
    setEducationList((prev) => {
      const newEntries = [...prev];
      newEntries[index].description = value;
      return newEntries;
    });
  }, []);

  useEffect(() => {
    // Check cooldown status when component mounts
    checkAiGenerationCooldown();
  }, [resumeId, email]);

  useEffect(() => {
    // Update cooldown timers every minute
    const activeEducation = Object.keys(cooldownTimeRemaining).filter(
      (index) => !canRegenerate[index] && cooldownTimeRemaining[index] > 0,
    );

    if (activeEducation.length > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTimeRemaining((prev) => {
          const updated = { ...prev };
          let hasChanges = false;

          activeEducation.forEach((index) => {
            const newTime = prev[index] - 1 / 60; // Subtract 1 minute in hours
            if (newTime <= 0) {
              setCanRegenerate((prevCan) => ({ ...prevCan, [index]: true }));
              updated[index] = 0;
              hasChanges = true;
            } else {
              updated[index] = newTime;
            }
          });

          if (hasChanges && Object.values(updated).every((time) => time <= 0)) {
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
      const resumeData = await EncryptedFirebaseService.getResumeData(
        email,
        resumeId,
      );
      const newCanRegenerate = {};
      const newCooldownTime = {};
      const newHasGenerated = {};

      educationList.forEach((_, index) => {
        const canRegen = EncryptedFirebaseService.canRegenerateAI(
          resumeData.aiGenerationTimestamps,
          "education",
        );
        const timeRemaining =
          EncryptedFirebaseService.getAiCooldownTimeRemaining(
            resumeData.aiGenerationTimestamps,
            "education",
          );

        newCanRegenerate[index] = canRegen;
        newCooldownTime[index] = timeRemaining;

        if (resumeData.aiGenerationTimestamps?.education) {
          newHasGenerated[index] = true;
        }
      });

      setCanRegenerate(newCanRegenerate);
      setCooldownTimeRemaining(newCooldownTime);
      setHasGenerated(newHasGenerated);
    } catch (error) {
      console.error("Error checking AI cooldown:", error);
    }
  };

  const generateContent = async (educationIndex) => {
    const education = educationList[educationIndex];

    if (!canRegenerate[educationIndex]) {
      toast.error(
        `AI regeneration available in ${Math.ceil(cooldownTimeRemaining[educationIndex] || 0)} hours`,
      );
      return;
    }

    if (!education.school || !education.degree) {
      toast.error("Please enter school and degree first");
      return;
    }

    setAiLoading(true);
    setCurrentEducationIndex(educationIndex);

    try {
      const PROMPT = prompt
        .replace("{school}", education.school)
        .replace("{degree}", education.degree)
        .replace("{fieldOfStudy}", education.fieldOfStudy)
        .replace(
          "{graduationDate}",
          education.graduationDate || "Expected graduation",
        );

      const aiResponse = await AIchatSession.sendMessage(PROMPT);
      console.log("AI Response:", aiResponse);

      if (!aiResponse) {
        throw new Error("No response from AI service");
      }

      // Extract text from response object
      let responseText = aiResponse;

      if (
        typeof aiResponse === "object" &&
        aiResponse.response &&
        aiResponse.response.text
      ) {
        responseText = aiResponse.response.text();
      } else if (typeof aiResponse === "object" && aiResponse.response) {
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
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error("Invalid response format from AI");
      }

      setAiGeneratedContent(parsedResponse);
      setHasGenerated((prev) => ({ ...prev, [educationIndex]: true }));
      setCanRegenerate((prev) => ({ ...prev, [educationIndex]: false }));

      // Update AI generation timestamp
      if (resumeId && email) {
        await EncryptedFirebaseService.updateAiGenerationTimestamp(
          email,
          resumeId,
          "education",
        );
        setCooldownTimeRemaining((prev) => ({ ...prev, [educationIndex]: 24 })); // Set 24-hour cooldown
      }

      toast.success("AI suggestions generated successfully!");
    } catch (error) {
      console.error("Error generating education content:", error);
      toast.error("Failed to generate AI suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiContent = useCallback(
    (selectedSuggestion) => {
      if (selectedSuggestion && currentEducationIndex !== null) {
        setEducationList((prev) => {
          const newEducation = [...prev];
          newEducation[currentEducationIndex] = {
            ...newEducation[currentEducationIndex],
            description: selectedSuggestion.description,
          };
          return newEducation;
        });
        toast.success("AI content applied successfully");
      }
    },
    [currentEducationIndex],
  );

  const applyAllAiContent = useCallback(() => {
    if (aiGeneratedContent && currentEducationIndex !== null) {
      // Take the first (most comprehensive) suggestion for better UX
      const bestSuggestion = aiGeneratedContent[0];

      setEducationList((prev) => {
        const newEducation = [...prev];
        newEducation[currentEducationIndex] = {
          ...newEducation[currentEducationIndex],
          description: bestSuggestion.description,
        };
        return newEducation;
      });
      toast.success("Best AI content applied successfully");
    }
  }, [currentEducationIndex, aiGeneratedContent]);

  const handleRegenerateContent = (educationIndex) => {
    if (!canRegenerate[educationIndex]) {
      toast.error(
        `AI regeneration available in ${Math.ceil(cooldownTimeRemaining[educationIndex] || 0)} hours`,
      );
      return;
    }

    setHasGenerated((prev) => ({ ...prev, [educationIndex]: false }));
    setAiGeneratedContent(null);
    generateContent(educationIndex);
  };

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
            <h2 className="font-bold text-lg sm:text-xl">Education</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Add your educational background
            </p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
        </div>
        <div>
          {educationList.map((item, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 border p-3 sm:p-4 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    School/University
                  </label>
                  <Input
                    name="school"
                    value={item.school}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="Enter school/university name"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Degree
                  </label>
                  <Input
                    name="degree"
                    value={item.degree}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="Bachelor's, Master's, PhD, etc."
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    City
                  </label>
                  <Input
                    name="city"
                    value={item.city}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="City"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    State
                  </label>
                  <Input
                    name="state"
                    value={item.state}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="State/Province"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Field of Study
                  </label>
                  <Input
                    name="fieldOfStudy"
                    value={item.fieldOfStudy}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="Computer Science, Engineering, etc."
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Graduation Date
                  </label>
                  <Input
                    type="date"
                    name="graduationDate"
                    value={item.graduationDate}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Description (Optional)
                    </label>
                    <AIButton
                      onClick={() =>
                        hasGenerated[index]
                          ? handleRegenerateContent(index)
                          : generateContent(index)
                      }
                      loading={aiLoading && currentEducationIndex === index}
                      loadingText="Creating content..."
                      disabled={
                        (aiLoading && currentEducationIndex === index) ||
                        (!canRegenerate[index] && hasGenerated[index])
                      }
                      className={`w-full sm:w-auto text-xs sm:text-sm ${!canRegenerate[index] && hasGenerated[index] ? "opacity-50 cursor-not-allowed" : ""}`}
                      style={{
                        opacity:
                          !canRegenerate[index] && hasGenerated[index]
                            ? "0.5"
                            : "1",
                        cursor:
                          !canRegenerate[index] && hasGenerated[index]
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {hasGenerated[index] && !canRegenerate[index]
                        ? `Available in ${formatCooldownTime(cooldownTimeRemaining[index] || 0)}`
                        : hasGenerated[index]
                          ? "Regenerate Content"
                          : "Generate Content"}
                    </AIButton>
                  </div>
                  <Textarea
                    value={item.description || ""}
                    onChange={(e) =>
                      handleTextareaChange(index, e.target.value)
                    }
                    className="w-full min-h-[100px]"
                    placeholder="Describe your educational experience, relevant coursework, achievements, or projects..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={addNewEducation}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            + Add More Education
          </Button>
          <Button
            variant="outline"
            onClick={removeEducation}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            - Remove
          </Button>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {aiGeneratedContent && currentEducationIndex !== null && (
        <div className="mt-6 w-full">
          <div className="p-3 sm:p-4 lg:p-5 shadow-lg rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">
                  AI Education Suggestions
                </h3>
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
                      <div className="text-xs text-violet-600 font-medium">
                        Click to apply
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {suggestion.description}
                    </p>
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

export default Education;
