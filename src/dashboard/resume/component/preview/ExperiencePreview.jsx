const ExperiencePreview = ({ resumeInfo }) => {
  const experience = resumeInfo?.experience || [];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return null;
    }
  };

  if (experience.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-4">
        No job experience data added.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center font-bold text-sm mb-2">
        Professional Experience
      </h2>
      <hr 
        className="border-[1.5px] my-2" 
        style={{borderColor: resumeInfo?.themeColor || "rgb(107 114 128)"}}  
      />
      {experience.map((exp, index) => (
        <div key={index} className="my-2">
          <h2 className="text-sm font-bold">
            {exp?.title || "Position title not provided"}
          </h2>
          <h2 className="text-xs flex justify-between">
            <span>
              {exp?.companyName || ""}
              {exp?.city && exp?.state ? `, ${exp?.city}, ${exp?.state}` : 
               exp?.city ? `, ${exp?.city}` : 
               exp?.state ? `, ${exp?.state}` : ""}
            </span>
            <span>
              {formatDate(exp?.startDate)} - {formatDate(exp?.endDate) || "Present"}
            </span>
          </h2>
          <div
            className="text-xs my-2 text-justify leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: exp?.workSummery || "No work summary provided.",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default ExperiencePreview;