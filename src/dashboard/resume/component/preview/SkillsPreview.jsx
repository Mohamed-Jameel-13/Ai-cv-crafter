const SkillsPreview = ({ resumeInfo }) => {
  const skills = resumeInfo?.skills;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-4">
        No skills data added.
      </div>
    );
  }

  return (
    <div className="my-1">
      <h2 className="text-center font-bold text-sm mb-2">Technical Skills</h2>
      <hr className="border-[1.5px] my-2" style={{borderColor: resumeInfo?.themeColor || "rgb(107 114 128)"}} />
      <div className="grid grid-cols-1 gap-1 sm:gap-2">
        {skills.map((skillCategory, index) => (
          <div key={index} className="mb-1 sm:mb-2 flex flex-col sm:flex-row sm:items-baseline">
            <span className="font-semibold text-sm mr-1 min-w-fit">{skillCategory.category}: </span>
            <span className="text-xs leading-relaxed break-words">{skillCategory.skills}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPreview;
