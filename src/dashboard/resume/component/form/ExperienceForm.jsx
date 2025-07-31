import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import RichTextEditor from "../RichTextEditor";
import { ResumeContext } from "@/context/ResumeContext";
import { toast } from "sonner";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { UserContext } from "@/context/UserContext";
import {
  getCurrentUserEmail,
  isUserAuthenticated,
  handleFirebaseError,
  debugAuthState,
} from "@/utils/firebase_helpers";

const formField = {
  title: "",
  companyName: "",
  city: "",
  state: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  workSummery: "",
};

const ExperienceForm = ({ resumeId, email, enableNext, isTemplateMode }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const userContext = useContext(UserContext);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Use stable initialization - only initialize once when component mounts
  const [experienceList, setExperienceList] = useState(() => {
    if (resumeInfo?.experience?.length > 0) {
      return resumeInfo.experience;
    }
    return [formField];
  });

  // Use refs to track initialization and prevent circular updates
  const autoSaveTimeoutRef = useRef(null);
  const previousDataRef = useRef(null);
  const hasInitialized = useRef(false);
  const isContextUpdating = useRef(false);
  const lastSavedData = useRef(null);

  // Initialize ONLY ONCE when component first mounts or when resumeInfo first becomes available
  useEffect(() => {
    if (!hasInitialized.current && resumeInfo?.experience?.length > 0) {
      console.log(
        "🔄 One-time initialization with context data:",
        resumeInfo.experience,
      );
      setExperienceList(resumeInfo.experience);
      previousDataRef.current = JSON.stringify(resumeInfo.experience);
      hasInitialized.current = true;
    } else if (!hasInitialized.current) {
      // First time with no data
      previousDataRef.current = JSON.stringify([formField]);
      hasInitialized.current = true;
    }
  }, [resumeInfo?.experience]); // This will only run when resumeInfo.experience first becomes available

  // Auto-save function with optimizations
  const autoSave = useCallback(
    async (experienceData) => {
      // Skip auto-save if in template mode or no resumeId
      if (
        isTemplateMode ||
        !resumeId ||
        !experienceData ||
        experienceData.length === 0
      ) {
        enableNext(true);
        return;
      }

      // Skip if data hasn't actually changed
      const dataString = JSON.stringify(experienceData);
      if (lastSavedData.current === dataString) {
        return;
      }

      setIsAutoSaving(true);
      setSaveError("");

      try {
        await EncryptedFirebaseService.updateResumeField(
          email,
          resumeId,
          "experience",
          experienceData,
        );
        lastSavedData.current = dataString;
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving encrypted experience:", error);
        setSaveError(
          "Auto-save failed. Please check your connection and try again.",
        );
      } finally {
        setIsAutoSaving(false);
      }
    },
    [email, resumeId, enableNext, isTemplateMode],
  );

  // Function to check if data has actually changed
  const hasDataChanged = useCallback((newData) => {
    const currentDataString = JSON.stringify(newData);
    const previousDataString = previousDataRef.current;

    return currentDataString !== previousDataString;
  }, []);

  // Optimized debounced auto-save effect - prevents flickering
  useEffect(() => {
    // Don't auto-save during initial render, if not initialized, or during context updates
    if (!hasInitialized.current || isContextUpdating.current) return;

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
        const hasData = experienceList.some(
          (exp) =>
            exp.title?.trim() ||
            exp.companyName?.trim() ||
            exp.workSummery?.trim(),
        );

        if (hasData && hasDataChanged(experienceList)) {
          autoSave(experienceList);
        } else {
          // Update context silently without triggering auto-save
          isContextUpdating.current = true;
          setResumeInfo((prevInfo) => ({
            ...prevInfo,
            experience: experienceList,
          }));
          previousDataRef.current = JSON.stringify(experienceList);

          setTimeout(() => {
            isContextUpdating.current = false;
          }, 100);
        }
      }
    }, 2000); // 2 seconds debounce

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [experienceList, autoSave, hasDataChanged, setResumeInfo]);

  // Cleanup timeout on unmount and save current state
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      // Save current state to context on unmount without causing updates
      if (hasInitialized.current && experienceList.length > 0) {
        isContextUpdating.current = true;
        setResumeInfo((prevInfo) => ({
          ...prevInfo,
          experience: experienceList,
        }));
      }
    };
  }, [experienceList, setResumeInfo]);

  // Manual save function for critical operations
  const manualSave = useCallback(async () => {
    if (experienceList.length > 0) {
      const hasData = experienceList.some(
        (exp) =>
          exp.title?.trim() ||
          exp.companyName?.trim() ||
          exp.workSummery?.trim(),
      );

      if (hasData) {
        await autoSave(experienceList);
      }
    }
  }, [experienceList, autoSave]);

  // Optimized handleChange to prevent unnecessary re-renders
  const handleChange = useCallback((index, event) => {
    const { name, value, type, checked } = event.target;
    setExperienceList((prevList) => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        [name]: type === "checkbox" ? checked : value,
      };

      // If currently working is checked, clear the end date
      if (name === "currentlyWorking" && checked) {
        newList[index].endDate = "";
      }

      return newList;
    });
  }, []);

  // Optimized rich text editor handler
  const handleRichTextEditor = useCallback((e, name, index) => {
    setExperienceList((prevList) => {
      const newList = [...prevList];
      newList[index] = {
        ...newList[index],
        [name]: e.target.value,
      };
      return newList;
    });
  }, []);

  const addNewExperience = () => {
    setExperienceList((prevList) => [...prevList, { ...formField }]);
  };

  const removeExperience = async () => {
    if (experienceList.length > 1) {
      setExperienceList((prevList) => prevList.slice(0, -1));
      // Trigger manual save after removal
      setTimeout(() => {
        manualSave();
      }, 100);
    }
  };

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">
              Professional Experience
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Add your previous job experience
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isAutoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Auto-saving...
              </div>
            )}
            {saveError && (
              <div className="text-xs text-red-500 max-w-48 text-right">
                {saveError}
              </div>
            )}
          </div>
        </div>
        <div>
          {experienceList.map((item, index) => (
            <div key={`experience-${index}`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 border p-3 sm:p-4 my-5 rounded-lg">
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Position Title
                  </label>
                  <Input
                    name="title"
                    value={item?.title || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Company Name
                  </label>
                  <Input
                    name="companyName"
                    value={item?.companyName || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    City
                  </label>
                  <Input
                    name="city"
                    value={item?.city || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                    placeholder="e.g. San Francisco"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    State
                  </label>
                  <Input
                    name="state"
                    value={item?.state || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                    placeholder="e.g. CA"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    name="startDate"
                    value={item?.startDate || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                  />
                </div>
                <div className="w-full">
                  <label className="text-xs sm:text-sm font-medium mb-1 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    name="endDate"
                    value={item?.endDate || ""}
                    onChange={(event) => handleChange(index, event)}
                    className="w-full bg-white"
                    disabled={item?.currentlyWorking}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        name="currentlyWorking"
                        checked={item?.currentlyWorking || false}
                        onChange={(event) => handleChange(index, event)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-2 focus:ring-primary focus:ring-offset-0"
                      />
                      <span className="select-none">I currently work here</span>
                    </label>
                  </div>
                </div>
                <div className="col-span-1 lg:col-span-2">
                  <RichTextEditor
                    index={index}
                    defaultValue={item?.workSummery || ""}
                    jobTitle={item?.title || ""}
                    resumeId={resumeId}
                    email={email}
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
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            + Add More Experience
          </Button>
          <Button
            variant="outline"
            onClick={removeExperience}
            className="text-primary hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
          >
            - Remove
          </Button>
          {saveError && (
            <Button
              variant="outline"
              onClick={manualSave}
              className="text-blue-600 hover:bg-blue-50 hover:border-[rgb(63,39,34)] border-blue-300 transition-colors text-sm w-full sm:w-auto"
            >
              💾 Retry Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ExperienceForm);
