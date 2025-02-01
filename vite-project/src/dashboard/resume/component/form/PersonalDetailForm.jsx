import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResumeContext } from "@/context/ResumeContext";
import { useContext, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { FaLinkedin, FaGithub, FaPhone, FaEnvelope } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { BiWorld } from "react-icons/bi";

const PersonalDetailForm = ({ resumeId, email, enableNext }) => {
  const { resumeInfo, setResumeInfo } = useContext(ResumeContext);
  const [loading, setLoading] = useState(false);
  const db = getFirestore(app);

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
      portfolio: resumeInfo?.personalDetail?.portfolio || ""
    }
  });

  useEffect(() => {
    if (resumeInfo?.personalDetail) {
      setFormData({
        personalDetail: {
          ...resumeInfo.personalDetail
        }
      });
    }
  }, [resumeInfo]);

  const handleInputChange = (e) => {
    enableNext(false);
    const { name, value } = e.target;
    
    const updatedPersonalDetail = {
      ...formData.personalDetail,
      [name]: value
    };

    setFormData({
      ...formData,
      personalDetail: updatedPersonalDetail
    });

    setResumeInfo(prev => ({
      ...prev,
      personalDetail: updatedPersonalDetail
    }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resumeRef = doc(
        db,
        `usersByEmail/${email}/resumes`,
        `resume-${resumeId}`
      );
      await setDoc(resumeRef, formData, { merge: true });
      toast.success("Details Updated");
      enableNext(true);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast.error("Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10">
      <h2 className="font-bold text-lg">Personal Detail</h2>
      <p>Get Started with the basic information</p>

      <form onSubmit={onSave}>
        <div className="grid grid-cols-2 mt-5 gap-3">
          <div>
            <label className="text-sm">First Name</label>
            <Input
              name="firstName"
              value={formData.personalDetail.firstName}
              required
              onChange={handleInputChange}
              placeholder="Enter firstName"
            />
          </div>
          <div>
            <label className="text-sm">Last Name</label>
            <Input
              name="lastName"
              value={formData.personalDetail.lastName}
              required
              onChange={handleInputChange}
              placeholder="Enter lastName"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm">Job Title</label>
            <Input
              name="jobTitle"
              value={formData.personalDetail.jobTitle}
              required
              onChange={handleInputChange}
              placeholder="Enter your Jobtitle"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm flex items-center gap-2">
              <IoLocationSharp className="text-black" /> Address
            </label>
            <Input
              name="address"
              value={formData.personalDetail.address}
              required
              onChange={handleInputChange}
              placeholder="Enter your Address"
            />
          </div>
          <div>
            <label className="text-sm flex items-center gap-2">
              <FaPhone className="text-black" /> Phone
            </label>
            <Input
              name="phone"
              value={formData.personalDetail.phone}
              required
              onChange={handleInputChange}
              placeholder="Enter your Phone no"
            />
          </div>
          <div>
            <label className="text-sm flex items-center gap-2">
              <FaEnvelope className="text-black" /> Email
            </label>
            <Input
              name="email"
              value={formData.personalDetail.email}
              required
              onChange={handleInputChange}
              placeholder="Enter your Email"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm flex items-center gap-2">
              <FaLinkedin className="text-black" /> LinkedIn URL
            </label>
            <Input
              name="linkedin"
              value={formData.personalDetail.linkedin}
              onChange={handleInputChange}
              placeholder="Enter your Linkedin link"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm flex items-center gap-2">
              <FaGithub className="text-black" /> GitHub URL
            </label>
            <Input
              name="github"
              value={formData.personalDetail.github}
              onChange={handleInputChange}
              placeholder="Enter your Github link"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm flex items-center gap-2">
              <BiWorld className="text-black" /> Portfolio URL
            </label>
            <Input
              name="portfolio"
              value={formData.personalDetail.portfolio}
              onChange={handleInputChange}
              placeholder="Enter your portfolio link"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PersonalDetailForm;
