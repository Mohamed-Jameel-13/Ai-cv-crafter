import { Input } from "@/components/ui/input";
import { useContext, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { ResumeContext } from "@/context/ResumeContext";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { toast } from "sonner";

const formField = {
  category: "",
  skills: "",
};

const Skills = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [skillsList, setSkillsList] = useState(() =>
    resumeInfo?.skills?.length > 0 ? resumeInfo.skills : [formField]
  );
  const [loading, setLoading] = useState(false);
  const [shouldUpdateContext, setShouldUpdateContext] = useState(false);

  useEffect(() => {
    if (shouldUpdateContext) {
      setResumeInfo((prev) => ({
        ...prev,
        skills: skillsList,
      }));
      setShouldUpdateContext(false);
    }
  }, [shouldUpdateContext, setResumeInfo, skillsList]);

  const handleChange = useCallback((index, name, value) => {
    setSkillsList((prev) => {
      const newEntries = [...prev];
      newEntries[index][name] = value;
      return newEntries;
    });
    setShouldUpdateContext(true);
  }, []);

  const addNewSkillCategory = useCallback(() => {
    setSkillsList((prev) => [...prev, { ...formField }]);
    setShouldUpdateContext(true);
  }, []);

  const removeSkillCategory = useCallback(() => {
    if (skillsList.length > 1) {
      setSkillsList((prev) => prev.slice(0, -1));
      setShouldUpdateContext(true);
    }
  }, [skillsList.length]);

  const onSave = async () => {
    setLoading(true);
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
          skills: skillsList.map((skill) => ({
            category: skill.category || "",
            skills: skill.skills || "",
          })),
        },
        { merge: true }
      );
      setLoading(false);
      toast.success("Skills updated successfully!");
      enableNext(true);
    } catch (error) {
      setLoading(false);
      console.error("Error saving to Firestore:", error);
      toast.error("Error updating skills!");
    }
  };

  return (
    <div>
      <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
        <h2 className="font-bold text-lg">Skills</h2>
        <p>Add your technical skills by category</p>

        <div>
          {skillsList.map((item, index) => (
            <div
              key={index}
              className="flex flex-col border rounded-lg p-3 mt-3"
            >
              <div className="w-full mb-2">
                <label className="text-xs">Category</label>
                <Input
                  value={item.category}
                  className="w-full"
                  onChange={(e) =>
                    handleChange(index, "category", e.target.value)
                  }
                />
              </div>
              <div className="w-full">
                <label className="text-xs">Skills (comma-separated)</label>
                <Input
                  value={item.skills}
                  className="w-full"
                  onChange={(e) =>
                    handleChange(index, "skills", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={addNewSkillCategory}
              className="text-primary"
            >
              + Add More Categories
            </Button>
            <Button
              variant="outline"
              onClick={removeSkillCategory}
              className="text-primary"
            >
              - Remove
            </Button>
          </div>
          <Button disabled={loading} onClick={onSave}>
            {loading ? <LoaderCircle className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Skills;
