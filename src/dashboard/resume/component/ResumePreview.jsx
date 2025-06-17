import { ResumeContext } from "@/context/ResumeContext";
import { useContext } from "react";
import PersonalDetailPreview from "./preview/PersonalDetailPreview";
import SummaryDetails from "./preview/SummaryDetails";
import ExperiencePreview from "./preview/ExperiencePreview";
import EducationalPreview from "./preview/EducationalPreview";
import SkillsPreview from "./preview/SkillsPreview";
import ProjectsPreview from "./preview/ProjectsPreview";

const ResumePreview = () => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);

  // Debug: Log theme color
  console.log('🎨 ResumePreview - Theme color:', resumeInfo?.themeColor);

  if (!resumeInfo) {
    return (
      <div className="text-center text-gray-500 text-lg font-medium py-20">
        Data needs to be added in the resume.
      </div>
    );
  }

  return (
    <div
      className="shadow-lg h-full p-8 border-t-[20px]"
      style={{borderColor: resumeInfo?.themeColor}}
    >
      {resumeInfo && (
        <div className="flex flex-col">
          <PersonalDetailPreview resumeInfo={resumeInfo} />
          <SummaryDetails resumeInfo={resumeInfo} />
          <ExperiencePreview resumeInfo={resumeInfo} />
          <SkillsPreview resumeInfo={resumeInfo} />
          <ProjectsPreview resumeInfo={resumeInfo} />
          <EducationalPreview resumeInfo={resumeInfo} />
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
