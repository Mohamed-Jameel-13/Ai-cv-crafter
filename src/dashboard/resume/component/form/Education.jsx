import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState, useCallback } from "react";
import RichTextEditor from "../RichTextEditor";
import { ResumeContext } from "@/context/ResumeContext";
import { toast } from "sonner";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";

const formField = {
  school: "",
  degree: "",
  city: "",
  state: "",
  fieldOfStudy: "",
  graduationDate: "",
  description: "",
};

const Education = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [educationList, setEducationList] = useState(() => 
    resumeInfo?.education?.length > 0 ? resumeInfo.education : [formField]
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Update context whenever educationList changes
  useEffect(() => {
    setResumeInfo(prev => ({
      ...prev,
      education: educationList
    }));
  }, [educationList, setResumeInfo]);

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
      await setDoc(resumeRef, { education: data }, { merge: true });
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
      if (educationList.length > 0 && educationList[0].school) {
        autoSave(educationList);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [educationList, autoSave]);

  const handleChange = useCallback((index, event) => {
    const { name, value } = event.target;
    setEducationList(prev => {
      const newEntries = [...prev];
      newEntries[index][name] = value;
      return newEntries;
    });
  }, []);

  const addNewEducation = useCallback(() => {
    setEducationList(prev => [...prev, { ...formField }]);
  }, []);

  const removeEducation = useCallback(() => {
    if (educationList.length > 1) {
      setEducationList(prev => prev.slice(0, -1));
    }
  }, [educationList.length]);

  const handleRichTextEditor = useCallback((e, name, index) => {
    setEducationList(prev => {
      const newEntries = [...prev];
      newEntries[index][name] = e.target.value;
      return newEntries;
    });
  }, []);

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Education</h2>
            <p className="text-sm sm:text-base text-gray-600">Add your educational background</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs font-medium">School/University</label>
                  <Input
                    name="school"
                    value={item.school}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Degree</label>
                  <Input
                    name="degree"
                    value={item.degree}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">City</label>
                  <Input
                    name="city"
                    value={item.city}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">State</label>
                  <Input
                    name="state"
                    value={item.state}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Field of Study</label>
                  <Input
                    name="fieldOfStudy"
                    value={item.fieldOfStudy}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Graduation Date</label>
                  <Input
                    type="date"
                    name="graduationDate"
                    value={item.graduationDate}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <RichTextEditor
                    index={index}
                    defaultValue={item.description || ''}
                    onRichTextEditorChange={(event) =>
                      handleRichTextEditor(event, "description", index)
                    }
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
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            + Add More Education
          </Button>
          <Button
            variant="outline"
            onClick={removeEducation}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            - Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Education; 
