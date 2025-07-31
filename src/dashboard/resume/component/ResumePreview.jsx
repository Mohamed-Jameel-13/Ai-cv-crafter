import { ResumeContext } from "@/context/ResumeContext";
import { useContext } from "react";
import PersonalDetailPreview from "./preview/PersonalDetailPreview";
import SummaryDetails from "./preview/SummaryDetails";
import ExperiencePreview from "./preview/ExperiencePreview";
import EducationalPreview from "./preview/EducationalPreview";
import SkillsPreview from "./preview/SkillsPreview";
import ProjectsPreview from "./preview/ProjectsPreview";
import CertificationPreview from "./preview/CertificationPreview";

const ResumePreview = () => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);

  // Debug: Log theme color
  console.log("🎨 ResumePreview - Theme color:", resumeInfo?.themeColor);

  if (!resumeInfo) {
    return (
      <div className="text-center text-gray-500 text-lg font-medium py-20">
        Data needs to be added in the resume.
      </div>
    );
  }

  const themeColor = resumeInfo?.themeColor || "#4B5563";

  return (
    <div
      className="a4-preview shadow-lg h-full p-3 sm:p-6 lg:p-8 border-t-20 bg-white print:shadow-none print:p-8 min-h-full mx-auto"
      style={{
        borderTopColor: themeColor,
        borderTopWidth: "20px",
        borderTopStyle: "solid",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
        colorAdjust: "exact",
        }}
      >
        {resumeInfo && (
          <div className="flex flex-col space-y-2 sm:space-y-3 text-xs sm:text-sm lg:text-base print:text-base">
            <PersonalDetailPreview resumeInfo={resumeInfo} />
            <SummaryDetails resumeInfo={resumeInfo} />
            <ExperiencePreview resumeInfo={resumeInfo} />
            <SkillsPreview resumeInfo={resumeInfo} />
            <ProjectsPreview resumeInfo={resumeInfo} />
            <EducationalPreview resumeInfo={resumeInfo} />
            <CertificationPreview resumeInfo={resumeInfo} />
          </div>
        )}
      </div>
    );
  };

export default ResumePreview;
