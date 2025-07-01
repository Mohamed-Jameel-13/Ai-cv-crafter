/* eslint-disable no-unused-vars */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Loader2 } from "lucide-react";
import { BtnBold, BtnBulletList, BtnItalic, BtnNumberedList, BtnUnderline, BtnLink, BtnStrikeThrough, Editor, EditorProvider, Separator, Toolbar } from "react-simple-wysiwyg";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AIButton } from "@/components/ui/ai-button";
import { AIchatSession } from "../../../../service/AiModel";

const PROMPT = `You are a professional resume expert specializing in writing compelling work experience descriptions. 

Job Title: {positionTitle}

Generate 5-7 highly effective, ATS-friendly bullet points for this job role that:
- Use strong action verbs (Led, Developed, Implemented, Achieved, Optimized, etc.)
- Include quantifiable results and metrics where appropriate (percentages, numbers, dollar amounts)
- Demonstrate both technical skills and business impact
- Are tailored for HR professionals and Applicant Tracking Systems (ATS)
- Show progression, leadership, and problem-solving abilities
- Use industry-relevant keywords and terminology
- Follow the STAR method (Situation, Task, Action, Result) structure

Each bullet point should be 1-2 lines long and focus on achievements rather than just responsibilities.

Return the response in JSON format with field "bullets" containing an array of professional bullet points.

Example format:
{
  "bullets": [
    "Led cross-functional team of 8 developers to deliver scalable web application, resulting in 40% increase in user engagement and $2M annual revenue growth",
    "Implemented automated testing framework reducing bug reports by 65% and deployment time by 50%, improving overall product quality and team efficiency"
  ]
}`;

function RichTextEditor({ onRichTextEditorChange, index, defaultValue, jobTitle }) {
  const [value, setValue] = useState(defaultValue || "");
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSuggestions, setAiGeneratedSuggestions] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Update local value when defaultValue changes (important for form reset/load)
  // Use ref to prevent flickering
  const isInitializing = useRef(true);
  
  useEffect(() => {
    if (isInitializing.current && defaultValue !== undefined) {
      setValue(defaultValue || "");
      isInitializing.current = false;
    }
  }, [defaultValue]);

  const GenerateSummaryFromaI = async () => {
    if (!jobTitle || jobTitle.trim() === '') {
      toast.error("Please first add job title, then try to generate");
      return;
    }

    setLoading(true);
    try {
      const prompt = PROMPT.replace("{positionTitle}", jobTitle);
      console.log("Prompt:", prompt);
      
      // Call AI service
      const aiResponse = await AIchatSession.sendMessage(prompt);
      console.log("AI Response:", aiResponse);
      
      if (!aiResponse) {
        throw new Error("No response from AI service");
      }
      
      // Parse the response as JSON
      let parsedResponse;
      let responseText = aiResponse;
      
      // If aiResponse is an object with response text, extract it
      if (typeof aiResponse === 'object' && aiResponse.response && aiResponse.response.text) {
        responseText = aiResponse.response.text();
      } else if (typeof aiResponse === 'object' && aiResponse.response) {
        responseText = aiResponse.response;
      }
      
      try {
        // Try to parse the response directly
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      // Validate the parsed response
      if (!parsedResponse?.bullets || !Array.isArray(parsedResponse.bullets)) {
        throw new Error('Invalid response format from AI');
      }

      console.log("Parsed Response:", parsedResponse);
      setAiGeneratedSuggestions(parsedResponse);
      setHasGenerated(true);
      toast.success("AI suggestions generated successfully!");
      
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate AI suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestionText) => {
    const newValue = suggestionText;
    setValue(newValue);
    // Create a mock event object that matches what the parent component expects
    const mockEvent = {
      target: {
        value: newValue
      }
    };
    // Trigger the parent component's change handler
    if (onRichTextEditorChange) {
      onRichTextEditorChange(mockEvent, index);
    }
    toast.success("Suggestion applied successfully!");
  };

  const handleApplyAllSuggestions = () => {
    if (aiGeneratedSuggestions && aiGeneratedSuggestions.bullets) {
      // Combine all bullet points into a single HTML list
      const allBullets = aiGeneratedSuggestions.bullets
        .map(bullet => `<li>${bullet}</li>`)
        .join('');
      const combinedContent = `<ul>${allBullets}</ul>`;
      
      setValue(combinedContent);
      // Create a mock event object that matches what the parent component expects
      const mockEvent = {
        target: {
          value: combinedContent
        }
      };
      // Trigger the parent component's change handler
      if (onRichTextEditorChange) {
        onRichTextEditorChange(mockEvent, index);
      }
      toast.success("All suggestions applied successfully!");
    }
  };

  const handleRegenerateContent = () => {
    setHasGenerated(false);
    setAiGeneratedSuggestions(null);
    GenerateSummaryFromaI();
  };

  const handleEditorChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    // Immediately notify parent component of changes
    if (onRichTextEditorChange) {
      onRichTextEditorChange(e, index);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between my-2">
        <label className="text-xs font-medium">Summary</label>
        <div className="flex gap-2">
          <AIButton
            onClick={hasGenerated ? handleRegenerateContent : GenerateSummaryFromaI}
            loading={loading}
            loadingText="Creating content..."
            disabled={loading}
            size="sm"
            className="text-xs h-8"
          >
            {hasGenerated ? "Regenerate Content" : "Generate Content"}
          </AIButton>
        </div>
      </div>

      <EditorProvider>
        <Editor
          value={value}
          onChange={handleEditorChange}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>

      {/* AI Suggestions Section */}
      {aiGeneratedSuggestions && (
        <div className="mt-4 w-full">
          <div className="p-3 sm:p-4 shadow-lg rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                </div>
                <h4 className="font-bold text-sm sm:text-base text-gray-900">AI Suggestions</h4>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleApplyAllSuggestions}
                  size="sm"
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm sm:text-xs h-8 w-full sm:w-auto"
                >
                  Apply All
                </Button>
                <Button
                  onClick={handleRegenerateContent}
                  variant="outline"
                  size="sm"
                  className="border-violet-300 hover:border-[rgb(63,39,34)] text-violet-700 hover:bg-violet-50 text-sm sm:text-xs h-8 w-full sm:w-auto"
                >
                  Regenerate
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {aiGeneratedSuggestions.bullets.map((suggestion, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 bg-white rounded-lg border border-violet-100">
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{suggestion}</p>
                  <Button
                    onClick={() => handleApplySuggestion(`<li>${suggestion}</li>`)}
                    size="sm"
                    variant="outline"
                    className="border-violet-300 hover:border-[rgb(63,39,34)] text-violet-700 hover:bg-violet-50 text-xs h-7 w-full sm:w-auto sm:min-w-16"
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RichTextEditor;