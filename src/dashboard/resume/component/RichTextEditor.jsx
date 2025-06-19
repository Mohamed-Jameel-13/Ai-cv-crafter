/* eslint-disable no-unused-vars */

import { Button } from "@/components/ui/button";
import { ResumeContext } from "@/context/ResumeContext";
import { Brain, Loader2 } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";
import { AIchatSession } from "../../../../service/AiModel";
import { toast } from "sonner";

const PROMPT = `Given the job position "{positionTitle}", provide three professional experience point suggestions for a resume. Each suggestion should be in JSON format with fields "experience_level" (values can be "Entry-level", "Mid-level", "Senior-level") and "points" (an array of 4-5 ATS-friendly bullet points as HTML list items). Output an array of JSON objects. Each point should be a complete sentence highlighting achievements and responsibilities. Format: [{"experience_level": "Entry-level", "points": ["<li>Point 1</li>", "<li>Point 2</li>", ...]}, ...]`;

const RichTextEditor = ({onRichTextEditorChange, index, defaultValue, value}) => {
  const [editorValue, setEditorValue] = useState('');
  const {resumeInfo, setResumeInfo} = useContext(ResumeContext)
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSuggestions, setAiGeneratedSuggestions] = useState(null);
  
  // Use ref to track if component is initialized to prevent unnecessary updates
  const isInitialized = useRef(false);
  const lastValueRef = useRef('');

  // Initialize editor value only once or when external value changes significantly
  useEffect(() => {
    const newValue = defaultValue || value || '';
    
    // Only update if the value has actually changed and it's different from what we last set
    if (!isInitialized.current || (newValue !== lastValueRef.current && newValue !== editorValue)) {
      setEditorValue(newValue);
      lastValueRef.current = newValue;
      isInitialized.current = true;
    }
  }, [defaultValue, value, editorValue]);

  const GenerateSummaryFromaI = async () => {
    try {
      setLoading(true);
      
      // Check if position title exists
      if (!resumeInfo?.experience?.[index]?.title) {
        toast.error("Please add position title");
        setLoading(false);
        return;
      }

      const positionTitle = resumeInfo.experience[index].title;
      console.log("Position title:", positionTitle);
      
      const prompt = PROMPT.replace('{positionTitle}', positionTitle);
      console.log("Prompt:", prompt);
      
      // Call AI service - it returns text directly
      const aiResponse = await AIchatSession.sendMessage(prompt);
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

      setAiGeneratedSuggestions(parsedResponse);
      toast.success("AI suggestions generated successfully!");
      
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error("Failed to generate AI suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (points) => {
    // Convert points array to HTML unordered list
    const htmlContent = `<ul>${points.join('')}</ul>`;
    setEditorValue(htmlContent);
    lastValueRef.current = htmlContent;
    
    // Trigger the onChange callback to update parent component
    if (onRichTextEditorChange) {
      const mockEvent = {
        target: {
          value: htmlContent
        }
      };
      onRichTextEditorChange(mockEvent);
    }
  };

  const handleEditorChange = (e) => {
    const newValue = e.target.value;
    setEditorValue(newValue);
    lastValueRef.current = newValue;
    
    if (onRichTextEditorChange) {
      onRichTextEditorChange(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 my-2">
        <label className="text-xs font-medium">Work Summary</label>
        <Button 
          onClick={GenerateSummaryFromaI}  
          variant="outline" 
          size="sm" 
          className="flex gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          disabled={loading}
        >
          <Brain className="h-4 w-4"/>
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4"/>
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <span>Generate from AI</span>
          )}
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={editorValue}
          onChange={handleEditorChange}
          className="min-h-[120px]"
        >
          <Toolbar>
            <BtnUndo />
            <BtnRedo />
            <Separator />
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <Separator />
            <BtnBulletList />
            <BtnNumberedList />
            <Separator />
            <BtnLink/>
            <BtnClearFormatting/>
            <HtmlButton/>
            <Separator/>
            <BtnStyles/>
          </Toolbar>
        </Editor>
      </EditorProvider>
      
      {/* AI Suggestions Section */}
      {aiGeneratedSuggestions && (
        <div className="mt-5 w-full">
          <h3 className="font-bold text-base sm:text-lg mb-3">AI Suggestions</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {aiGeneratedSuggestions.map((suggestion, suggestionIndex) => (
              <div
                key={suggestionIndex}
                className="p-3 sm:p-4 shadow-md rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-lg transition-all duration-200 border border-gray-200 w-full"
                onClick={() => handleSuggestionClick(suggestion.points)}
              >
                <h4 className="font-bold my-1 text-primary text-sm sm:text-base">
                  Level: <span className="text-red-500">{suggestion.experience_level}</span>
                </h4>
                <div className="text-xs sm:text-sm mt-2">
                  <ul className="list-disc list-inside space-y-1">
                    {suggestion.points.map((point, pointIndex) => (
                      <li 
                        key={pointIndex} 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: point.replace(/<\/?li>/g, '') }} 
                      />
                    ))}
                  </ul>
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

export default RichTextEditor;