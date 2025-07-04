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
import { Brain, ExternalLink } from "lucide-react";

const formField = {
  name: "",
  issuer: "",
  date: "",
  expirationDate: "",
  link: "",
  description: "",
};

const prompt = `You are a professional resume expert specializing in certification descriptions.

Certification Details:
- Certification Name: {name}
- Issuer: {issuer}
- Date Obtained: {date}
- Expiration Date: {expirationDate}
- Link: {link}

Generate 3 comprehensive certification descriptions that are:
- ATS-friendly and professionally written
- Highlight the skills and knowledge gained from the certification
- Demonstrate the value and relevance of the certification to the field
- Include any specialized training, competencies, or expertise acquired
- Tailored for different experience levels (Entry Level, Mid-Level, Senior Level)

Each description should be 1-3 lines and focus on the professional value and skills gained.

Return as JSON array with fields: "experience_level" (Entry Level/Mid-Level/Senior Level), "description".

Example format:
[
  {
    "experience_level": "Entry Level",
    "description": "Demonstrated proficiency in cloud computing fundamentals, including AWS services, security best practices, and cost optimization strategies. Validated knowledge of core AWS architectural principles and deployment models."
  }
]`;

const Certification = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [certificationList, setCertificationList] = useState(() =>
    resumeInfo?.certifications?.length > 0
      ? resumeInfo.certifications
      : [formField],
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [currentCertificationIndex, setCurrentCertificationIndex] =
    useState(null);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(null);
  const [hasGenerated, setHasGenerated] = useState({});
  const [canRegenerate, setCanRegenerate] = useState({});
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState({});
  const intervalRef = useRef(null);

  // Update context whenever certificationList changes
  useEffect(() => {
    setResumeInfo((prev) => ({
      ...prev,
      certifications: certificationList,
    }));
  }, [certificationList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(
    async (certificationData) => {
      if (isTemplateMode || !resumeId) {
        enableNext(true);
        return;
      }

      setIsAutoSaving(true);
      try {
        await EncryptedFirebaseService.updateResumeField(
          email,
          resumeId,
          "certifications",
          certificationData,
        );
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving certifications:", error);
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
      if (certificationList.length > 0 && certificationList[0].name) {
        autoSave(certificationList);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [certificationList, autoSave]);

  const handleChange = useCallback((index, event) => {
    const { name, value } = event.target;
    setCertificationList((prev) => {
      const newEntries = [...prev];
      newEntries[index][name] = value;
      return newEntries;
    });
  }, []);

  const addNewCertification = useCallback(() => {
    setCertificationList((prev) => [...prev, { ...formField }]);
  }, []);

  const removeCertification = useCallback(() => {
    if (certificationList.length > 1) {
      setCertificationList((prev) => prev.slice(0, -1));
    }
  }, [certificationList.length]);

  const handleTextareaChange = useCallback((index, value) => {
    setCertificationList((prev) => {
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
    const activeCertifications = Object.keys(cooldownTimeRemaining).filter(
      (index) => !canRegenerate[index] && cooldownTimeRemaining[index] > 0,
    );

    if (activeCertifications.length > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTimeRemaining((prev) => {
          const updated = { ...prev };
          let hasChanges = false;

          activeCertifications.forEach((index) => {
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

      certificationList.forEach((_, index) => {
        const canRegen = EncryptedFirebaseService.canRegenerateAI(
          resumeData.aiGenerationTimestamps,
          "certifications",
        );
        const timeRemaining =
          EncryptedFirebaseService.getAiCooldownTimeRemaining(
            resumeData.aiGenerationTimestamps,
            "certifications",
          );

        newCanRegenerate[index] = canRegen;
        newCooldownTime[index] = timeRemaining;

        if (resumeData.aiGenerationTimestamps?.certifications) {
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

  const generateContent = async (certificationIndex) => {
    if (!resumeId || !email || isTemplateMode) {
      toast.error("AI generation is only available for saved resumes");
      return;
    }

    if (
      !canRegenerate[certificationIndex] &&
      hasGenerated[certificationIndex]
    ) {
      const timeRemaining = formatCooldownTime(
        cooldownTimeRemaining[certificationIndex],
      );
      toast.error(`Please wait ${timeRemaining} before generating again`);
      return;
    }

    const certification = certificationList[certificationIndex];
    if (!certification.name || !certification.issuer) {
      toast.error(
        "Please fill in certification name and issuer before generating content",
      );
      return;
    }

    setAiLoading(true);
    setCurrentCertificationIndex(certificationIndex);

    try {
      const certificationPrompt = prompt
        .replace("{name}", certification.name)
        .replace("{issuer}", certification.issuer)
        .replace("{date}", certification.date || "Not specified")
        .replace(
          "{expirationDate}",
          certification.expirationDate || "No expiration",
        )
        .replace("{link}", certification.link || "Not specified");

      const result = await AIchatSession.sendMessage(certificationPrompt);
      const responseText = result.response.text();

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generatedContent = JSON.parse(jsonMatch[0]);
        setAiGeneratedContent(generatedContent);

        // Update AI generation timestamp
        await EncryptedFirebaseService.updateAiGenerationTimestamp(
          email,
          resumeId,
          "certifications",
        );

        // Update cooldown status
        setHasGenerated((prev) => ({ ...prev, [certificationIndex]: true }));
        setCanRegenerate((prev) => ({ ...prev, [certificationIndex]: false }));
        setCooldownTimeRemaining((prev) => ({
          ...prev,
          [certificationIndex]: 24,
        })); // 24 hours

        toast.success("AI content generated successfully!");
      } else {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegenerateContent = (certificationIndex) => {
    if (!canRegenerate[certificationIndex]) {
      toast.error(
        `AI regeneration available in ${Math.ceil(cooldownTimeRemaining[certificationIndex] || 0)} hours`,
      );
      return;
    }

    setHasGenerated((prev) => ({ ...prev, [certificationIndex]: false }));
    setAiGeneratedContent(null);
    generateContent(certificationIndex);
  };

  const formatCooldownTime = (hours) => {
    if (hours < 1) {
      return `${Math.ceil(hours * 60)} minutes`;
    }
    return `${Math.ceil(hours)} hours`;
  };

  const applyAiContent = useCallback(
    (suggestion) => {
      if (currentCertificationIndex !== null) {
        handleTextareaChange(currentCertificationIndex, suggestion.description);
        setAiGeneratedContent(null);
        setCurrentCertificationIndex(null);
        toast.success("AI content applied successfully!");
      }
    },
    [currentCertificationIndex, handleTextareaChange],
  );

  const applyAllAiContent = useCallback(() => {
    if (
      aiGeneratedContent &&
      aiGeneratedContent.length > 0 &&
      currentCertificationIndex !== null
    ) {
      // Find the best suggestion (first one)
      const bestSuggestion = aiGeneratedContent[0];
      handleTextareaChange(
        currentCertificationIndex,
        bestSuggestion.description,
      );
      setAiGeneratedContent(null);
      setCurrentCertificationIndex(null);
      toast.success("Best AI content applied successfully");
    }
  }, [currentCertificationIndex, aiGeneratedContent, handleTextareaChange]);

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Certifications</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Add your professional certifications and credentials
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
          {certificationList.map((item, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 border p-3 sm:p-4 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Certification Name
                  </label>
                  <Input
                    name="name"
                    value={item.name}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Issuing Organization
                  </label>
                  <Input
                    name="issuer"
                    value={item.issuer}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Date Obtained
                  </label>
                  <Input
                    name="date"
                    type="date"
                    value={item.date}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Expiration Date
                  </label>
                  <Input
                    name="expirationDate"
                    type="date"
                    value={item.expirationDate}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block flex items-center gap-1">
                    <ExternalLink size={14} className="text-blue-600" />
                    Link
                    <span className="text-xs text-gray-500">
                      (will show as "Link")
                    </span>
                  </label>
                  <Input
                    name="link"
                    value={item.link}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="https://certification-provider.com/certificate/abc123"
                  />
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <label className="text-xs sm:text-sm font-medium">
                      Description (Optional)
                    </label>
                    {!isTemplateMode && (
                      <AIButton
                        onClick={() =>
                          hasGenerated[index]
                            ? handleRegenerateContent(index)
                            : generateContent(index)
                        }
                        loading={
                          aiLoading && currentCertificationIndex === index
                        }
                        loadingText="Creating content..."
                        disabled={
                          (aiLoading && currentCertificationIndex === index) ||
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
                    )}
                  </div>
                  <Textarea
                    value={item.description || ""}
                    onChange={(e) =>
                      handleTextareaChange(index, e.target.value)
                    }
                    className="w-full min-h-[100px]"
                    placeholder="Describe the skills and knowledge gained from this certification, competencies acquired, or professional value..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={addNewCertification}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            + Add More Certification
          </Button>
          <Button
            variant="outline"
            onClick={removeCertification}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            - Remove
          </Button>
        </div>
      </div>

      {/* AI Suggestions Section */}
      {aiGeneratedContent && currentCertificationIndex !== null && (
        <div className="mt-6 w-full">
          <div className="p-3 sm:p-4 lg:p-5 shadow-lg rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">
                  AI Certification Suggestions
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

export default Certification;
