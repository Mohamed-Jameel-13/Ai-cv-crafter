import { FaPhone, FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

const PersonalDetailPreview = ({ resumeInfo }) => {
  const personalDetail = resumeInfo?.personalDetail;

  if (!personalDetail) {
    return (
      <div className="text-center text-gray-500 text-sm font-medium py-4">
        No personal data added.
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-xl text-center">
        {personalDetail.firstName || "First Name"} {personalDetail.lastName || "Last Name"}
      </h2>
      
      <h2 className="text-center text-sm font-medium mt-1">
        {personalDetail.jobTitle || "Job Title"}
      </h2>

      {/* Contact Information */}
      <div className="flex flex-col items-center gap-1 mt-1">
        {personalDetail.address && (
          <div className="flex items-center gap-1 text-xs">
            <IoLocationSharp className="text-black" />
            {personalDetail.address}
          </div>
        )}

        <div className="flex justify-center items-center gap-2 text-xs">
          {personalDetail.phone && (
            <span className="flex items-center gap-1">
              <FaPhone className="text-black" />
              +91-{personalDetail.phone}
            </span>
          )}
          {personalDetail.email && (
            <>
              <span>|</span>
              <span className="flex items-center gap-1">
                <FaEnvelope className="text-black" />
                {personalDetail.email}
              </span>
            </>
          )}
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center items-center gap-2 text-xs mt-1">
          {personalDetail?.linkedin && (
            <a
              href={personalDetail.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-black hover:text-[#0077b5]"
            >
              <FaLinkedin className="text-black" />
              LinkedIn
            </a>
          )}
          {personalDetail?.github && (
            <>
              <span>|</span>
              <a
                href={personalDetail.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-black hover:text-gray-700"
              >
                <FaGithub className="text-black" />
                GitHub
              </a>
            </>
          )}
          {personalDetail?.portfolio && (
            <>
              <span>|</span>
              <a
                href={personalDetail.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-black hover:text-blue-600"
              >
                <BiWorld className="text-black" />
                Portfolio
              </a>
            </>
          )}
        </div>
      </div>

      <hr className="border-[1.5px] mt-2 mb-3 border-black" />
    </div>
  );
};

export default PersonalDetailPreview;
