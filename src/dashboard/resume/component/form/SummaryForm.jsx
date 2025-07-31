import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIButton } from "@/components/ui/ai-button";
import { ResumeContext } from "@/context/ResumeContext";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import { sendMessageToAI } from "../../../../../service/AiModel";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";

const prompt = `Given the job title "{jobTitle}", provide three job summary suggestions for a resume. Each suggestion should be in JSON format with fields "experience_level" (values can be "Fresher", "Mid-level", "Experienced") and "summary" (a brief summary). Output an array of JSON objects.`;

const SummaryForm = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || "");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (summary) {
      setResumeInfo((prev) => ({
        ...prev,
        summary,
      }));
    }
  }, [summary, setResumeInfo]);

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
        "summary",
      );
      const timeRemaining = EncryptedFirebaseService.getAiCooldownTimeRemaining(
        resumeData.aiGenerationTimestamps,
        "summary",
      );

      setCanRegenerate(canRegen);
      setCooldownTimeRemaining(timeRemaining);

      if (resumeData.aiGenerationTimestamps?.summary) {
        setHasGenerated(true);
      }
    } catch (error) {
      console.error("Error checking AI cooldown:", error);
    }
  };

  // Auto-save function
  const autoSave = useCallback(
    async (summaryData) => {
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
          "summary",
          summaryData,
        );
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving encrypted summary:", error);
        toast.error("Auto-save failed. Please check your connection.");
      } finally {
        setIsAutoSaving(false);
      }
    },
    [email, resumeId, enableNext, isTemplateMode],
  );

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave(summary);
    }, 1000);

    return () => clearTimeout(timer);
  }, [summary, autoSave]);

  const generateSummary = async () => {
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

    setLoading(true);
    try {
      const finalPrompt = prompt.replace("{jobTitle}", jobTitle);
      const result = await sendMessageToAI(finalPrompt);

      // Handle response text extraction
      let responseText = result;
      if (
        typeof result === "object" &&
        result.response &&
        result.response.text
      ) {
        responseText = result.response.text();
      } else if (typeof result === "object" && result.response) {
        responseText = result.response;
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

      console.log("Parsed Response:", parsedResponse);
      setAiGenerateSummeryList(parsedResponse);
      setHasGenerated(true);
      setCanRegenerate(false);

      // Update AI generation timestamp
      if (resumeId && email) {
        await EncryptedFirebaseService.updateAiGenerationTimestamp(
          email,
          resumeId,
          "summary",
        );
        setCooldownTimeRemaining(24); // Set 24-hour cooldown
      }

      toast.success("AI suggestions generated successfully!");
    } catch (error) {
      console.error("Error generating summaries:", error);
      toast.error(
        error.message || "Failed to generate summaries. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (summaryText) => {
    setSummary(summaryText);
    setAiGenerateSummeryList(null);
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
            <h2 className="font-bold text-lg sm:text-xl">Summary Detail</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Add Summary for your job title
            </p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
        </div>
        <div className="mt-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <label className="text-sm font-medium">Add Summary</label>
            <AIButton
              onClick={generateSummary}
              loading={loading}
              loadingText="Creating summaries..."
              disabled={loading || (!canRegenerate && hasGenerated)}
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
                  ? "Regenerate Summary"
                  : "Generate Summary"}
            </AIButton>
          </div>
          <Textarea
            className="mt-5 w-full min-h-32 resize-none bg-white"
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a compelling summary that highlights your key strengths and career objectives"
          />
        </div>
      </div>

      {/* AI Generated Summaries Section */}
      {aiGeneratedSummeryList && (
        <div className="mt-5 w-full">
          <div className="p-3 sm:p-5 shadow-lg rounded-lg">
            <h2 className="font-bold text-base sm:text-lg mb-3">
              AI Generated Summaries
            </h2>
            <div className="space-y-3">
              {aiGeneratedSummeryList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(item.summary)}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[rgb(63,39,34)] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {item.experience_level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Click on any summary to use it
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryForm;
