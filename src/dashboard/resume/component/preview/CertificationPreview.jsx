import { FaExternalLinkAlt } from "react-icons/fa";

const CertificationPreview = ({ resumeInfo }) => {
  const certifications = resumeInfo?.certifications || [];

  if (certifications.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-1">
        No certifications added.
      </div>
    );
  }

  return (
    <div className="mt-0">
      <h2 className="text-center font-bold text-sm mb-0.5">Certifications</h2>
      <hr
        className="border-[1px] my-0.5"
        style={{ borderColor: resumeInfo?.themeColor || "rgb(107 114 128)" }}
      />

      {certifications.map((certification, index) => (
        <div key={index} className="my-3">
          {/* Top Row: Contains Name with inline Link and Date */}
          <div className="flex justify-between items-start gap-2">
            {/* Left side: Certification name with inline link - ALWAYS KEEP TOGETHER */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-1">
                <h2 className="text-sm font-bold">
                  {certification?.name || "Certification Not Specified"}
                </h2>
                {certification.link && (
                  <>
                    <span className="text-sm font-bold text-gray-600">•</span>
                    <a
                      href={certification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-black hover:text-blue-600 no-underline"
                    >
                      <FaExternalLinkAlt size={10} />
                      <span>Link</span>
                    </a>
                  </>
                )}
              </div>
            </div>
            {/* Right side: Date */}
            <div className="text-xs font-medium text-gray-600 flex-shrink-0 ml-2">
              {certification?.date || "Date not specified"}
            </div>
          </div>

          {/* Second Row: Issuer, placed below the flex container */}
          <p className="text-xs italic text-gray-600 mt-1">
            {certification?.issuer || "Issuer not specified"}
          </p>

          {/* Optional Description */}
          {certification?.description && (
            <div
              className="text-xs mt-2 text-justify leading-relaxed [&>ul]:list-disc [&>ul]:list-inside [&>ol]:list-decimal [&>ol]:list-inside [&>li]:mb-1 [&>ul]:space-y-1 [&>ol]:space-y-1"
              dangerouslySetInnerHTML={{
                __html: certification.description,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CertificationPreview;
