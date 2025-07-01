import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIButton } from "@/components/ui/ai-button";
import { ResumeContext } from "@/context/ResumeContext";
import { useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import { AIchatSession } from "../../../../../service/AiModel";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";

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
    // Skip auto-save if no resumeId (template mode)
    if (!resumeId) {
      enableNext(true);
      return;
    }
    
    setIsAutoSaving(true);
    try {
      await EncryptedFirebaseService.updateResumeField(email, resumeId, 'summary', summaryData);
      enableNext(true);
    } catch (error) {
      console.error("Error auto-saving encrypted summary:", error);
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
      
      // Parse the response as JSON
      let parsedResponse;
      try {
        // Try to parse the response directly
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
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

      console.log("Parsed Response:", parsedResponse);
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
    setAiGenerateSummeryList(null);
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
            <AIButton
              onClick={generateSummary}
              loading={loading}
              loadingText="Creating summaries..."
              className="w-full sm:w-auto"
            >
              Generate Summary
            </AIButton>
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
        <div className="mt-6 w-full">
          <div className="p-3 sm:p-5 shadow-lg rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">AI Suggestions</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {aiGeneratedSummeryList.map((item, index) => (
                <div
                  key={index}
                  className="group p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg hover:border-[rgb(63,39,34)] transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleSuggestionClick(item.summary)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 rounded-full">
                      {item.experience_level}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-xs text-violet-600 font-medium">Click to apply</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{item.summary}</p>
                  <div className="mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center text-xs text-violet-600 font-medium">
                      Use this summary
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiGenerateSummeryList(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                Dismiss Suggestions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryForm;