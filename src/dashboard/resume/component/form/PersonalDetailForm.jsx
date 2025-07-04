import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeContext } from "@/context/ResumeContext";
import { useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { FaLinkedin, FaGithub, FaPhone, FaEnvelope } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

const PersonalDetailForm = ({
  resumeId,
  email,
  enableNext,
  isTemplateMode,
}) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const [formData, setFormData] = useState({
    personalDetail: {
      firstName: resumeInfo?.personalDetail?.firstName || "",
      lastName: resumeInfo?.personalDetail?.lastName || "",
      jobTitle: resumeInfo?.personalDetail?.jobTitle || "",
      address: resumeInfo?.personalDetail?.address || "",
      phone: resumeInfo?.personalDetail?.phone || "",
      email: resumeInfo?.personalDetail?.email || "",
      linkedin: resumeInfo?.personalDetail?.linkedin || "",
      github: resumeInfo?.personalDetail?.github || "",
      portfolio: resumeInfo?.personalDetail?.portfolio || "",
    },
  });

  useEffect(() => {
    if (resumeInfo?.personalDetail) {
      setFormData({
        personalDetail: {
          ...resumeInfo.personalDetail,
        },
      });
    }
  }, [resumeInfo]);

  // Auto-save function with encryption
  const autoSave = useCallback(
    async (data) => {
      // Skip auto-save if in template mode or no resumeId
      if (isTemplateMode || !resumeId) {
        enableNext(true);
        return;
      }

      setIsAutoSaving(true);
      try {
        await EncryptedFirebaseService.updateResumeField(
          email,
          resumeId,
          "personalDetail",
          data.personalDetail,
        );
        enableNext(true);
      } catch (error) {
        console.error("Error auto-saving encrypted data:", error);
        toast.error("Auto-save failed. Please check your connection.");
      } finally {
        setIsAutoSaving(false);
      }
    },
    [email, resumeId, enableNext, isTemplateMode],
  );

  // Debounced auto-save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (
        formData.personalDetail.firstName ||
        formData.personalDetail.lastName
      ) {
        autoSave(formData);
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData, autoSave]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedPersonalDetail = {
      ...formData.personalDetail,
      [name]: value,
    };

    setFormData({
      ...formData,
      personalDetail: updatedPersonalDetail,
    });

    setResumeInfo((prev) => ({
      ...prev,
      personalDetail: updatedPersonalDetail,
    }));
  };

  return (
    <div className="w-full">
      <div className="p-3 sm:p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10 w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg sm:text-xl">Personal Detail</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Get Started with the basic information
            </p>
          </div>
          {isAutoSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-3">
          <div className="w-full">
            <label className="text-sm font-medium">First Name</label>
            <Input
              name="firstName"
              value={formData.personalDetail.firstName}
              required
              onChange={handleInputChange}
              placeholder="Enter firstName"
              className="w-full"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium">Last Name</label>
            <Input
              name="lastName"
              value={formData.personalDetail.lastName}
              required
              onChange={handleInputChange}
              placeholder="Enter lastName"
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium">Job Title</label>
            <Input
              name="jobTitle"
              value={formData.personalDetail.jobTitle}
              required
              onChange={handleInputChange}
              placeholder="Enter your Jobtitle"
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <IoLocationSharp className="text-black" /> Address
            </label>
            <Input
              name="address"
              value={formData.personalDetail.address}
              required
              onChange={handleInputChange}
              placeholder="Enter your Address"
              className="w-full"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaPhone className="text-black" /> Phone
            </label>
            <Input
              name="phone"
              value={formData.personalDetail.phone}
              required
              onChange={handleInputChange}
              placeholder="Enter your Phone no"
              className="w-full"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaEnvelope className="text-black" /> Email
            </label>
            <Input
              name="email"
              value={formData.personalDetail.email}
              required
              onChange={handleInputChange}
              placeholder="Enter your Email"
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaLinkedin className="text-black" /> LinkedIn URL
            </label>
            <Input
              name="linkedin"
              value={formData.personalDetail.linkedin}
              onChange={handleInputChange}
              placeholder="Enter your Linkedin link"
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaGithub className="text-black" /> GitHub URL
            </label>
            <Input
              name="github"
              value={formData.personalDetail.github}
              onChange={handleInputChange}
              placeholder="Enter your Github link"
              className="w-full"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BiWorld className="text-black" /> Portfolio URL
            </label>
            <Input
              name="portfolio"
              value={formData.personalDetail.portfolio}
              onChange={handleInputChange}
              placeholder="Enter your portfolio link"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailForm;
