/* eslint-disable no-unused-vars */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Loader2 } from "lucide-react";
import { BtnBold, BtnBulletList, BtnItalic, BtnNumberedList, BtnUnderline, BtnLink, BtnStrikeThrough, Editor, EditorProvider, Separator, Toolbar } from "react-simple-wysiwyg";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { AIButton } from "@/components/ui/ai-button";
import { AIchatSession } from "../../../../service/AiModel";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import Logger from "@/utils/logger";

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

function RichTextEditor({ onRichTextEditorChange, index, defaultValue, jobTitle, resumeId, email }) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSuggestions, setAiGeneratedSuggestions] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // Check cooldown status when component mounts
    checkAiGenerationCooldown();
  }, [resumeId, email]);

  useEffect(() => {
    // Update cooldown timer every minute if in cooldown
    if (!canRegenerate && cooldownTimeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setCooldownTimeRemaining(prev => {
          const newTime = prev - (1/60); // Subtract 1 minute in hours
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
    if (!resumeId || !email) return;
    
    try {
      const resumeData = await EncryptedFirebaseService.getResumeData(email, resumeId);
      const canRegen = EncryptedFirebaseService.canRegenerateAI(resumeData.aiGenerationTimestamps, 'experience');
      const timeRemaining = EncryptedFirebaseService.getAiCooldownTimeRemaining(resumeData.aiGenerationTimestamps, 'experience');
      
      setCanRegenerate(canRegen);
      setCooldownTimeRemaining(timeRemaining);
      
      if (resumeData.aiGenerationTimestamps?.experience) {
        setHasGenerated(true);
      }
    } catch (error) {
      Logger.error('Error checking AI cooldown:', error);
    }
  };

  const GenerateSummaryFromaI = async () => {
    if (!canRegenerate) {
      toast.error(`AI regeneration available in ${Math.ceil(cooldownTimeRemaining)} hours`);
      return;
    }

    setLoading(true);
    const prompt = PROMPT.replace("{positionTitle}", jobTitle || "Professional");

    try {
      const result = await AIchatSession.sendMessage(prompt);
      let parsedResult;
      
      try {
        const responseText = typeof result === 'object' && result.response && result.response.text 
          ? result.response.text() 
          : result.toString();
        
        parsedResult = JSON.parse(responseText);
      } catch (parseError) {
        Logger.error("Error parsing AI response:", parseError);
        toast.error("Failed to parse AI response. Please try again.");
        return;
      }

      if (parsedResult && parsedResult.bullets && Array.isArray(parsedResult.bullets)) {
        setAiGeneratedSuggestions(parsedResult);
        setHasGenerated(true);
        setCanRegenerate(false);
        
        // Update AI generation timestamp
        if (resumeId && email) {
          await EncryptedFirebaseService.updateAiGenerationTimestamp(email, resumeId, 'experience');
          setCooldownTimeRemaining(24); // Set 24-hour cooldown
        }
        
        toast.success("AI suggestions generated successfully!");
      } else {
        toast.error("Invalid response format from AI. Please try again.");
      }
    } catch (error) {
      Logger.error("AI Generation Error:", error);
      toast.error("Failed to generate suggestions. Please try again.");
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
    if (!canRegenerate) {
      toast.error(`AI regeneration available in ${Math.ceil(cooldownTimeRemaining)} hours`);
      return;
    }
    
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

  const formatCooldownTime = (hours) => {
    if (hours < 1) {
      return `${Math.ceil(hours * 60)} minutes`;
    }
    return `${Math.ceil(hours)} hours`;
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
            disabled={loading || (!canRegenerate && hasGenerated)}
            size="sm"
            className={`text-xs h-8 ${!canRegenerate && hasGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              opacity: !canRegenerate && hasGenerated ? '0.5' : '1',
              cursor: !canRegenerate && hasGenerated ? 'not-allowed' : 'pointer'
            }}
          >
            {hasGenerated && !canRegenerate ? `Available in ${formatCooldownTime(cooldownTimeRemaining)}` : 
             hasGenerated ? "Regenerate Content" : "Generate Content"}
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
                  disabled={!canRegenerate}
                  className={`border-violet-300 hover:border-[rgb(63,39,34)] text-violet-700 hover:bg-violet-50 text-sm sm:text-xs h-8 w-full sm:w-auto ${!canRegenerate ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {canRegenerate ? 'Regenerate' : `Available in ${formatCooldownTime(cooldownTimeRemaining)}`}
                </Button>
              </div>
            </div>

            {/* Rest of the suggestions display */}
            <div className="space-y-3">
              {aiGeneratedSuggestions.bullets.map((bullet, bulletIndex) => (
                <div key={bulletIndex} className="p-2 sm:p-3 bg-white rounded border hover:border-violet-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <p className="text-sm text-gray-700 flex-1">{bullet}</p>
                    <Button
                      onClick={() => handleApplySuggestion(bullet)}
                      size="sm"
                      variant="outline"
                      className="text-xs w-full sm:w-auto"
                    >
                      Use This
                    </Button>
                  </div>
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