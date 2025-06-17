import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState, useCallback } from "react";
import RichTextEditor from "../RichTextEditor";
import { ResumeContext } from "@/context/ResumeContext";
import { toast } from "sonner";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";

const formField = {
  title: "",
  companyName: "",
  city: "",
  state: "",
  startDate: "",
  endDate: "",
  workSummery: "",
};

const ExperienceForm = ({ resumeId, email, enableNext }) => {
  const [experienceList, setExperienceList] = useState([formField]);
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (resumeInfo?.experience?.length > 0) {
      setExperienceList(resumeInfo.experience);
    }
  }, [resumeInfo?.experience]);

  // Update context whenever experienceList changes
  useEffect(() => {
    setResumeInfo((prevInfo) => ({
      ...prevInfo,
      experience: experienceList,
    }));
  }, [experienceList, setResumeInfo]);

  // Auto-save function
  const autoSave = useCallback(async (data) => {
    setIsAutoSaving(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(db, `usersByEmail/${email}/resumes`, `resume-${resumeId}`);
      
      await setDoc(resumeRef, {
        experience: data
      }, { merge: true });

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
      if (experienceList.length > 0 && experienceList[0].title) {
        autoSave(experienceList);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [experienceList, autoSave]);

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    setExperienceList((prevList) => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        [name]: value,
      };
      return newList;
    });
  };

  const handleRichTextEditor = (e, name, index) => {
    setExperienceList((prevList) => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        [name]: e.target.value,
      };
      return newList;
    });
  };

  const addNewExperience = () => {
    setExperienceList((prevList) => [...prevList, { ...formField }]);
  };

  const removeExperience = () => {
    if (experienceList.length > 1) {
      setExperienceList((prevList) => prevList.slice(0, -1));
    }
  };

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Professional Experience</h2>
            <p className="text-sm sm:text-base text-gray-600">Add your previous job experience</p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
        </div>
        <div>
          {experienceList.map((item, index) => (
            <div key={index}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs font-medium">Position Title</label>
                  <Input
                    name="title"
                    value={item.title}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Company Name</label>
                  <Input
                    name="companyName"
                    value={item.companyName}
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
                  <label className="text-xs font-medium">Start Date</label>
                  <Input
                    type="date"
                    name="startDate"
                    value={item.startDate}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">End Date</label>
                  <Input
                    type="date"
                    name="endDate"
                    value={item.endDate}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <RichTextEditor
                    index={index}
                    defaultValue={item.workSummery || ''}
                    onRichTextEditorChange={(event) =>
                      handleRichTextEditor(event, "workSummery", index)
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
            onClick={addNewExperience}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            + Add More Experience
          </Button>
          <Button
            variant="outline"
            onClick={removeExperience}
            className="text-primary hover:bg-primary hover:text-white transition-colors w-full sm:w-auto"
          >
            - Remove
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;