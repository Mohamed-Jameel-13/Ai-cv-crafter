import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeContext } from "@/context/ResumeContext";
import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import { AIchatSession } from "../../../../../service/AiModel";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";

const prompt = `Given the job title "{jobTitle}", provide three job summary suggestions for a resume. Each suggestion should be in JSON format with fields "experience_level" (values can be "Fresher", "Mid-level", "Experienced") and "summary" (a brief summary). Output an array of JSON objects.`;

const SummaryForm = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [summary, setSummary] = useState(resumeInfo?.summary || "");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummeryList, setAiGenerateSummeryList] = useState();

  useEffect(() => {
    if (summary) {
      setResumeInfo((prev) => ({
        ...prev,
        summary,
      }));
    }
  }, [summary, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(async (summaryData) => {
    setIsAutoSaving(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(
        db,
        `usersByEmail/${email}/resumes`,
        `resume-${resumeId}`
      );
      await setDoc(resumeRef, { summary: summaryData }, { merge: true });
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
      if (summary.trim()) {
        autoSave(summary);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [summary, autoSave]);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const PROMPT = prompt.replace("{jobTitle}", resumeInfo?.personalDetail?.jobTitle || "your job title");
      
      // Call the AI service
      const response = await AIchatSession.sendMessage(PROMPT);
      
      // Parse the response as JSON
      let parsedResponse;
      try {
        // Try to parse the response directly
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
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

      setAiGenerateSummeryList(parsedResponse);
      toast.success("AI suggestions generated successfully!");
    } catch (error) {
      console.error("Error generating summaries:", error);
      toast.error(error.message || "Failed to generate summaries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (summaryText) => {
    setSummary(summaryText);
  };

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Summary Detail</h2>
            <p className="text-sm sm:text-base text-gray-600">Add Summary for your job title</p>
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
            <Button
              size="sm"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-white transition-colors flex gap-2 w-full sm:w-auto"
              type="button"
              onClick={generateSummary}
              disabled={loading}
            >
              <Brain className="h-4 w-4" />
              {loading ? <Loader2 className="animate-spin" /> : "Generate from AI"}
            </Button>
          </div>
          <Textarea
            className="mt-5 w-full min-h-[100px]"
            required
            onChange={(e) => setSummary(e.target.value)}
            value={summary}
            placeholder="Write your job summary here..."
          />
        </div>
      </div>
      {aiGeneratedSummeryList && (
        <div className="my-5 w-full">
          <h2 className="font-bold text-base sm:text-lg mb-3">AI Suggestions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {aiGeneratedSummeryList.map((item, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 shadow-md rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-lg transition-all duration-200 border border-gray-200"
                onClick={() => handleSuggestionClick(item.summary)}
              >
                <h3 className="font-bold my-1 text-primary text-sm sm:text-base">
                  Level: <span className="text-red-500">{item.experience_level}</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{item.summary}</p>
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

export default SummaryForm;