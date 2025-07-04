const EducationalPreview = ({ resumeInfo }) => {
  const education = resumeInfo?.education || [];

  if (education.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-1">
        No educational data added.
      </div>
    );
  }

  return (
    <div className="mt-0">
      <h2 className="text-center font-bold text-sm mb-0.5">Education</h2>
      <hr
        className="border-[1px] my-0.5"
        style={{ borderColor: resumeInfo?.themeColor || "rgb(107 114 128)" }}
      />

      {education.map((educationItem, index) => (
        <div key={index} className="mb-1">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold">
              {educationItem?.school || "University Not Specified"}
            </h2>
            <span className="text-xs">
              {[educationItem?.city, educationItem?.state]
                .filter(Boolean)
                .join(", ")}
            </span>
          </div>
          <div className="text-xs flex justify-between">
            <span>
              {educationItem?.degree || "Degree not specified"} in{" "}
              {educationItem?.fieldOfStudy || "Field not specified"}
            </span>
            <span>{educationItem?.graduationDate || "Date not specified"}</span>
          </div>
          {educationItem?.description && (
            <div
              className="text-xs mt-2 text-justify leading-relaxed [&>ul]:list-disc [&>ul]:list-inside [&>ol]:list-decimal [&>ol]:list-inside [&>li]:mb-1 [&>ul]:space-y-1 [&>ol]:space-y-1"
              dangerouslySetInnerHTML={{
                __html: educationItem.description,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default EducationalPreview;
