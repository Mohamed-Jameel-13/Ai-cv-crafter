import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormSection from "../../component/FormSection";
import ResumePreview from "../../component/ResumePreview";
import { ResumeContext } from "@/context/ResumeContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";

const EditResume = () => {
  const params = useParams();
  const [resumeInfo, setResumeInfo] = useState(null);

  useEffect(() => {
    GetResumeInfo();
  }, []);

  const GetResumeInfo = async () => {
    try {
      console.log("Fetching encrypted resume:", params);

      const decryptedData = await EncryptedFirebaseService.getResumeData(
        params.email,
        params.resumeId,
      );

      console.log("✅ Resume decrypted successfully");
      setResumeInfo(decryptedData);
    } catch (error) {
      console.error("Error fetching encrypted resume:", error);
      setResumeInfo(null);
    }
  };

  return (
    <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 p-4 sm:p-6 md:p-8 lg:p-10 gap-6 lg:gap-10 max-w-7xl mx-auto">
          <FormSection />
          <ResumePreview />
        </div>
      </div>
    </ResumeContext.Provider>
  );
};

export default EditResume;
