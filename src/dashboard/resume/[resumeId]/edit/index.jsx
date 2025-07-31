import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FormSection from "../../component/FormSection";
import ResumePreview from "../../component/ResumePreview";
import { ResumeContext } from "@/context/ResumeContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import AdUnit from "@/components/AdUnit";

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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 p-2 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <div className="lg:col-span-2 xl:col-span-2">
            <FormSection />
          </div>
          <div className="lg:col-span-1 xl:col-span-2 flex items-start justify-center mt-4 lg:mt-0">
            <ResumePreview />
          </div>
        </div>
      </div>
    </ResumeContext.Provider>
  );
};

export default EditResume;
