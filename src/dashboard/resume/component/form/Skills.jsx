import { Input } from "@/components/ui/input";
import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Brain } from "lucide-react";
import { AIButton } from "@/components/ui/ai-button";
import { ResumeContext } from "@/context/ResumeContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { toast } from "sonner";
import { AIchatSession } from "../../../../../service/AiModel";

const formField = {
  category: "",
  skills: "",
};

const prompt = `Given the job title "{jobTitle}", provide skill suggestions organized by categories for a resume. Return a JSON array with objects containing "category" (skill category name) and "skills" (comma-separated list of relevant ATS-friendly skills). Include 4-6 categories like Technical Skills, Programming Languages, Tools & Technologies, Soft Skills, etc. Format: [{"category": "Technical Skills", "skills": "skill1, skill2, skill3"}, ...]`;

const Skills = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [skillsList, setSkillsList] = useState(() =>
    resumeInfo?.skills?.length > 0 ? resumeInfo.skills : [formField],
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedSkills, setAiGeneratedSkills] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0);
  const intervalRef = useRef(null);

  // Track previous data to prevent unnecessary context updates
  const previousDataRef = useRef(null);
  const hasInitialized = useRef(false);
  const isContextUpdating = useRef(false);

  // Initialize only once
  useEffect(() => {
    if (!hasInitialized.current && resumeInfo?.skills?.length > 0) {
      setSkillsList(resumeInfo.skills);
      previousDataRef.current = JSON.stringify(resumeInfo.skills);
      hasInitialized.current = true;
    } else if (!hasInitialized.current) {
      previousDataRef.current = JSON.stringify([formField]);
      hasInitialized.current = true;
    }
  }, [resumeInfo?.skills]);

  // Optimized context update - only when data actually changes
  useEffect(() => {
    if (!hasInitialized.current || isContextUpdating.current) return;

    const currentDataString = JSON.stringify(skillsList);
    if (currentDataString !== previousDataRef.current) {
      // Only update if skills data has meaningful content
      if (
        skillsList &&
        skillsList.length > 0 &&
        skillsList.some(
          (skill) => skill.category?.trim() || skill.skills?.trim(),
        )
      ) {
        isContextUpdating.current = true;
        setResumeInfo((prev) => ({
          ...prev,
          skills: skillsList,
        }));
        previousDataRef.current = currentDataString;

        setTimeout(() => {
          isContextUpdating.current = false;
        }, 100);
      }
    }
  }, [skillsList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(
    async (skillsData) => {
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
          "skills",
          skillsData,
        );
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving encrypted skills:", error);
        toast.error("Auto-save failed. Please check your connection.");
      } finally {
        setIsAutoSaving(false);
      }
    },
    [email, resumeId, enableNext, isTemplateMode],
  );

  // Debounced auto-save
  useEffect(() => {
    if (!hasInitialized.current) return;

    const timeoutId = setTimeout(() => {
      if (
        skillsList.length > 0 &&
        skillsList.some((skill) => skill.category?.trim())
      ) {
        const skillsData = skillsList.map((skill) => ({
          category: skill.category || "",
          skills: skill.skills || "",
        }));
        autoSave(skillsData);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [skillsList, autoSave]);

  const handleChange = useCallback((index, name, value) => {
    setSkillsList((prev) => {
      const newEntries = [...prev];
      newEntries[index][name] = value;
      return newEntries;
    });
  }, []);

  useEffect(() => {
    // Check cooldown status when component mounts
    checkAiGenerationCooldown();
  }, [resumeId, email]);

  useEffect(() => {
    // Update cooldown timer every minute if in cooldown
    if (!canRegenerate && cooldownTimeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTimeRemaining((prev) => {
          const newTime = prev - 1 / 60; // Subtract 1 minute in hours
          if (newTime <= 0) {
            setCanRegenerate(true);
            clearInterval(intervalRef.current);
            return 0;
          }
          return newTime;
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
      const canRegen = EncryptedFirebaseService.canRegenerateAI(
        resumeData.aiGenerationTimestamps,
        "skills",
      );
      const timeRemaining = EncryptedFirebaseService.getAiCooldownTimeRemaining(
        resumeData.aiGenerationTimestamps,
        "skills",
      );

      setCanRegenerate(canRegen);
      setCooldownTimeRemaining(timeRemaining);

      if (resumeData.aiGenerationTimestamps?.skills) {
        setHasGenerated(true);
      }
    } catch (error) {
      console.error("Error checking AI cooldown:", error);
    }
  };

  const generateSkillSuggestions = async () => {
    if (!canRegenerate) {
      toast.error(
        `AI regeneration available in ${Math.ceil(cooldownTimeRemaining)} hours`,
      );
      return;
    }

    const jobTitle = resumeInfo?.personalDetail?.jobTitle;
    if (!jobTitle) {
      toast.error(
        "Please add your job title first in Personal Details section",
      );
      return;
    }

    setAiLoading(true);
    try {
      const PROMPT = prompt.replace("{jobTitle}", jobTitle);
      const aiResponse = await AIchatSession.sendMessage(PROMPT);

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

      setAiGeneratedSkills(parsedResponse);
      setHasGenerated(true);
      setCanRegenerate(false);

      // Update AI generation timestamp
      if (resumeId && email) {
        await EncryptedFirebaseService.updateAiGenerationTimestamp(
          email,
          resumeId,
          "skills",
        );
        setCooldownTimeRemaining(24); // Set 24-hour cooldown
      }

      toast.success("AI skills generated successfully!");
    } catch (error) {
      console.error("Error generating skills:", error);
      toast.error("Failed to generate skills. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiSkills = useCallback(() => {
    if (aiGeneratedSkills) {
      setSkillsList(aiGeneratedSkills);
      setAiGeneratedSkills(null);
      toast.success("AI skills applied successfully!");
    }
  }, [aiGeneratedSkills]);

  const addNewSkillCategory = useCallback(() => {
    setSkillsList((prev) => [...prev, { ...formField }]);
  }, []);

  const removeSkillCategory = useCallback(() => {
    if (skillsList.length > 1) {
      setSkillsList((prev) => prev.slice(0, -1));
    }
  }, [skillsList.length]);

  const formatCooldownTime = (hours) => {
    if (hours < 1) {
      return `${Math.ceil(hours * 60)} minutes`;
    }
    return `${Math.ceil(hours)} hours`;
  };

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div>
              <h2 className="font-bold text-lg sm:text-xl">Skills</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Add your technical skills by category
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Auto-saving...
                </div>
              )}
              <AIButton
                onClick={generateSkillSuggestions}
                loading={aiLoading}
                loadingText="Creating skills..."
                disabled={aiLoading || (!canRegenerate && hasGenerated)}
                className={`w-full sm:w-auto ${!canRegenerate && hasGenerated ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{
                  opacity: !canRegenerate && hasGenerated ? "0.5" : "1",
                  cursor:
                    !canRegenerate && hasGenerated ? "not-allowed" : "pointer",
                }}
              >
                {hasGenerated && !canRegenerate
                  ? `Available in ${formatCooldownTime(cooldownTimeRemaining)}`
                  : hasGenerated
                    ? "Regenerate Skills"
                    : "Generate Skills"}
              </AIButton>
            </div>
          </div>
        </div>

        <div>
          {skillsList.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-lg p-3 mt-3"
            >
              <div className="w-full">
                <label className="text-xs font-medium">Category</label>
                <Input
                  value={item.category}
                  className="w-full"
                  onChange={(e) =>
                    handleChange(index, "category", e.target.value)
                  }
                  placeholder="e.g., Programming Languages"
                />
              </div>
              <div className="w-full">
                <label className="text-xs font-medium">
                  Skills (comma-separated)
                </label>
                <Input
                  value={item.skills}
                  className="w-full"
                  onChange={(e) =>
                    handleChange(index, "skills", e.target.value)
                  }
                  placeholder="e.g., JavaScript, Python, React"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
            variant="outline"
            onClick={addNewSkillCategory}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            + Add More Categories
          </Button>
          <Button
            variant="outline"
            onClick={removeSkillCategory}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            - Remove
          </Button>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {aiGeneratedSkills && (
        <div className="mt-5 w-full">
          <div className="p-3 sm:p-5 shadow-lg rounded-lg">
            <h2 className="font-bold text-base sm:text-lg mb-3">
              AI Skill Suggestions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {aiGeneratedSkills.map((skillCategory, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-gray-50 hover:border-[rgb(63,39,34)] transition-colors"
                >
                  <h3 className="font-semibold text-sm sm:text-base text-primary">
                    {skillCategory.category}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    {skillCategory.skills}
                  </p>
                </div>
              ))}
            </div>
            <Button onClick={applyAiSkills} className="w-full">
              Apply These Skills
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Skills);
