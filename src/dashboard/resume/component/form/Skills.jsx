import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle, Brain } from "lucide-react";
import { ResumeContext } from "@/context/ResumeContext";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { toast } from "sonner";
import { AIchatSession } from "../../../../../service/AiModel";

const formField = {
  category: "",
  skills: "",
};

const prompt = `Given the job title "{jobTitle}", provide skill suggestions organized by categories for a resume. Return a JSON array with objects containing "category" (skill category name) and "skills" (comma-separated list of relevant ATS-friendly skills). Include 4-6 categories like Technical Skills, Programming Languages, Tools & Technologies, Soft Skills, etc. Format: [{"category": "Technical Skills", "skills": "skill1, skill2, skill3"}, ...]`;

const Skills = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [skillsList, setSkillsList] = useState(() =>
    resumeInfo?.skills?.length > 0 ? resumeInfo.skills : [formField]
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedSkills, setAiGeneratedSkills] = useState(null);

  useEffect(() => {
    setResumeInfo((prev) => ({
      ...prev,
      skills: skillsList,
    }));
  }, [skillsList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(async (data) => {
    setIsAutoSaving(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(
        db,
        `usersByEmail/${email}/resumes`,
        `resume-${resumeId}`
      );
      await setDoc(
        resumeRef,
        {
          skills: data.map((skill) => ({
            category: skill.category || "",
            skills: skill.skills || "",
          })),
        },
        { merge: true }
      );
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
      if (skillsList.length > 0 && skillsList[0].category) {
        autoSave(skillsList);
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

  const generateSkillSuggestions = async () => {
    if (!resumeInfo?.personalDetail?.jobTitle) {
      toast.error("Please add job title in Personal Details section first");
      return;
    }

    setAiLoading(true);
    try {
      const PROMPT = prompt.replace("{jobTitle}", resumeInfo.personalDetail.jobTitle);
      console.log("Prompt:", PROMPT);
      
      // Call AI service
      const aiResponse = await AIchatSession.sendMessage(PROMPT);
      console.log("AI Response:", aiResponse);
      
      if (!aiResponse) {
        throw new Error("No response from AI service");
      }
      
      // Parse the response as JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      if (!Array.isArray(parsedResponse) || parsedResponse.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      setAiGeneratedSkills(parsedResponse);
      toast.success("AI skill suggestions generated successfully!");
      
    } catch (error) {
      console.error("Error generating skills:", error);
      toast.error("Failed to generate skill suggestions. Please try again.");
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

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
            <div>
              <h2 className="font-bold text-lg sm:text-xl">Skills</h2>
              <p className="text-sm sm:text-base text-gray-600">Add your technical skills by category</p>
            </div>
            <div className="flex items-center gap-3">
              {isAutoSaving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  Auto-saving...
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-white transition-colors flex gap-2 w-full sm:w-auto"
                onClick={generateSkillSuggestions}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    <span>Generate from AI</span>
                  </>
                )}
              </Button>
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
                <label className="text-xs font-medium">Skills (comma-separated)</label>
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
            <h2 className="font-bold text-base sm:text-lg mb-3">AI Skill Suggestions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {aiGeneratedSkills.map((skillCategory, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
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
            <Button 
              onClick={applyAiSkills}
              className="w-full"
            >
              Apply These Skills
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
