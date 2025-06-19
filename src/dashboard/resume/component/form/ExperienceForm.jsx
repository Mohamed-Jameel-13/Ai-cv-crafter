import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
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
  
  // Use refs to track initialization and prevent circular updates
  const isInitialized = useRef(false);
  const autoSaveTimeoutRef = useRef(null);
  const previousDataRef = useRef(null);

  // Initialize form with existing data ONLY ONCE
  useEffect(() => {
    if (resumeInfo?.experience?.length > 0 && !isInitialized.current) {
      setExperienceList(resumeInfo.experience);
      // Store initial data as previous data
      previousDataRef.current = JSON.stringify(resumeInfo.experience);
      isInitialized.current = true;
    } else if (!resumeInfo?.experience && !isInitialized.current) {
      // If no existing data, mark as initialized with default
      previousDataRef.current = JSON.stringify([formField]);
      isInitialized.current = true;
    }
  }, [resumeInfo?.experience]);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data) => {
    if (!isInitialized.current) return; // Don't auto-save during initialization
    
    setIsAutoSaving(true);
    try {
      const db = getFirestore(app);
      const resumeRef = doc(db, `usersByEmail/${email}/resumes`, `resume-${resumeId}`);
      
      await setDoc(resumeRef, {
        experience: data
      }, { merge: true });

      // Update context without causing re-initialization
      setResumeInfo((prevInfo) => ({
        ...prevInfo,
        experience: data,
      }));

      // Update previous data reference
      previousDataRef.current = JSON.stringify(data);

      enableNext(true);
    } catch (error) {
      console.error("Error auto-saving to Firestore:", error);
      toast.error("Auto-save failed. Please check your connection.");
    } finally {
      setIsAutoSaving(false);
    }
  }, [email, resumeId, enableNext, setResumeInfo]);

  // Function to check if data has actually changed
  const hasDataChanged = useCallback((newData) => {
    const currentDataString = JSON.stringify(newData);
    const previousDataString = previousDataRef.current;
    
    return currentDataString !== previousDataString;
  }, []);

  // Debounced auto-save effect - only triggers on actual data changes
  useEffect(() => {
    if (!isInitialized.current) return;

    // Check if data has actually changed
    if (!hasDataChanged(experienceList)) {
      return; // No change, don't trigger autosave
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (experienceList.length > 0) {
        // Check if there's meaningful data to save
        const hasData = experienceList.some(exp => 
          exp.title?.trim() || exp.companyName?.trim() || exp.workSummery?.trim()
        );
        
        if (hasData && hasDataChanged(experienceList)) {
          autoSave(experienceList);
        }
      }
    }, 2000); // 2 seconds debounce

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [experienceList, autoSave, hasDataChanged]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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
            <div key={`experience-${index}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border p-3 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs font-medium">Position Title</label>
                  <Input
                    name="title"
                    value={item?.title || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Company Name</label>
                  <Input
                    name="companyName"
                    value={item?.companyName || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">City</label>
                  <Input
                    name="city"
                    value={item?.city || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g. San Francisco"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">State</label>
                  <Input
                    name="state"
                    value={item?.state || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                    placeholder="e.g. CA"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input
                    type="date"
                    name="startDate"
                    value={item?.startDate || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs font-medium">End Date</label>
                  <Input
                    type="date"
                    name="endDate"
                    value={item?.endDate || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <RichTextEditor
                    index={index}
                    defaultValue={item?.workSummery || ''}
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