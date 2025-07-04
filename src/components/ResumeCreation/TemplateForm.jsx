import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Home, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import { getTemplateById } from "@/data/templates";
import { ResumeContext } from "@/context/ResumeContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";
import { toast } from "sonner";
import TemplateAiService from "@/service/TemplateAiService";
import Logger from "@/utils/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import form components from default resume workflow
import PersonalDetailForm from "@/dashboard/resume/component/form/PersonalDetailForm";
import SummaryForm from "@/dashboard/resume/component/form/SummaryForm";
import ExperienceForm from "@/dashboard/resume/component/form/ExperienceForm";
import Skills from "@/dashboard/resume/component/form/Skills";
import Projects from "@/dashboard/resume/component/form/Projects";
import Certification from "@/dashboard/resume/component/form/Certification";
import Education from "@/dashboard/resume/component/form/Education";

const TemplateForm = () => {
  const { templateId, resumeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [template, setTemplate] = useState(null);
  const [activeSection, setActiveSection] = useState(1);
  const [enableNext, setEnableNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [resumeInfo, setResumeInfo] = useState({});
  const [tempResumeId, setTempResumeId] = useState(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // Form sections configuration
  const formSections = [
    { id: 1, name: "Personal Details", component: "personal", required: true },
    { id: 2, name: "Summary", component: "summary", required: false },
    { id: 3, name: "Experience", component: "experience", required: true },
    { id: 4, name: "Skills", component: "skills", required: true },
    { id: 5, name: "Projects", component: "projects", required: false },
    {
      id: 6,
      name: "Certifications",
      component: "certifications",
      required: false,
    },
    { id: 7, name: "Education", component: "education", required: true },
    { id: 8, name: "Review & Generate", component: "review", required: false },
  ];

  useEffect(() => {
    const loadResumeData = async () => {
      if (resumeId && user?.email) {
        // EDIT MODE
        setLoading(true);
        try {
          const data = await EncryptedFirebaseService.getResumeData(
            user.email,
            resumeId,
          );
          setResumeInfo(data);
          setResumeTitle(data.title);
          const templateData = getTemplateById(data.templateId);
          setTemplate(templateData);
          setTempResumeId(resumeId);
        } catch (error) {
          Logger.error("Error loading resume:", error);
          toast.error("Resume not found.");
          navigate("/dashboard");
        }
        setLoading(false);
      } else if (templateId) {
        // CREATE MODE
        const templateData = getTemplateById(templateId);
        if (templateData) {
          setTemplate(templateData);
          setResumeTitle(`${templateData.name} Resume`);
          setTempResumeId(Date.now().toString());
        } else {
          navigate("/create/templates");
        }
      }
    };
    loadResumeData();
  }, [resumeId, templateId, navigate, user?.email]);

  const currentSection = formSections.find(
    (section) => section.id === activeSection,
  );

  const handleNext = () => {
    if (activeSection < formSections.length) {
      setActiveSection(activeSection + 1);
    }
  };

  const handlePrevious = () => {
    if (activeSection > 1) {
      setActiveSection(activeSection - 1);
    }
  };

  const generateResumeWithAI = async () => {
    if (!user?.uid || !resumeTitle || !template) {
      toast.error("Missing required information");
      return;
    }

    setLoading(true);
    Logger.log(
      "🚀 Starting AI resume generation with template:",
      template.aiTemplateName,
    );

    try {
      // Validate required data
      if (
        !resumeInfo.personalDetail?.firstName ||
        !resumeInfo.personalDetail?.email
      ) {
        throw new Error("Personal details are required");
      }

      if (!resumeInfo.experience || resumeInfo.experience.length === 0) {
        throw new Error("At least one work experience is required");
      }

      // Prepare data for AI
      const resumeData = {
        personalDetail: resumeInfo.personalDetail || {},
        summary: resumeInfo.summary || "",
        work: resumeInfo.experience || [], // Map experience to work for AI
        skills: resumeInfo.skills || [],
        projects: resumeInfo.projects || [],
        certifications: resumeInfo.certifications || [],
        education: resumeInfo.education || [],
      };

      Logger.log("📊 Resume data prepared:", resumeData);

      // Generate resume with AI using template name
      const aiResult = await TemplateAiService.generateTemplateResume(
        template.aiTemplateName,
        resumeData,
      );

      if (!aiResult.success) {
        throw new Error("Failed to generate resume");
      }

      Logger.log("✅ AI generation successful");

      // Prepare complete resume document data
      const resumeDocData = {
        title: resumeTitle,
        userId: user.uid,
        userEmail: user.email,
        templateId: template.id,
        templateName: template.name,
        aiTemplateName: template.aiTemplateName,
        personalDetail: resumeData.personalDetail,
        summary: resumeData.summary,
        experience: resumeInfo.experience, // Use original field name for storage
        skills: resumeData.skills,
        projects: resumeData.projects,
        certifications: resumeData.certifications,
        education: resumeData.education,
        pdfBase64: aiResult.pdfBase64,
        latexCode: aiResult.latexCode,
        updatedAt: new Date().toISOString(),
        status: "completed",
        themeColor: "#F6C49E", // Default orange theme
        aiGenerationTimestamps: {
          summary: null,
          experience: null,
          skills: null,
          projects: null,
          certifications: null,
          education: null,
        },
      };

      // Save to Firestore (Create or Update) with encryption
      let finalResumeId;

      if (resumeId) {
        // UPDATE existing resume
        finalResumeId = resumeId;
        await EncryptedFirebaseService.saveResumeData(
          user.email,
          finalResumeId,
          {
            ...resumeDocData,
            resumeId: finalResumeId,
          },
          { merge: true },
        );
      } else {
        // CREATE new resume with complete data (no empty resume creation)
        const createResult = await EncryptedFirebaseService.createNewResume(
          user.email,
          resumeDocData,
        );
        finalResumeId = createResult.resumeId;
      }

      Logger.log("💾 Resume saved to Firestore");
      toast.success(
        resumeId
          ? "Resume updated successfully!"
          : "Resume generated successfully!",
      );

      // Navigate to view the created/updated resume
      navigate(`/dashboard/${user.email}/${finalResumeId}/view`);
    } catch (error) {
      Logger.error("❌ Resume generation failed:", error);

      if (error.message === "RESUME_LIMIT_REACHED") {
        setShowLimitDialog(true);
      } else {
        toast.error(`Failed to generate resume: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFormSection = () => {
    const commonProps = {
      resumeId: resumeId,
      email: user?.email,
      enableNext: setEnableNext,
      isTemplateMode: !resumeId,
    };

    switch (currentSection.component) {
      case "personal":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <PersonalDetailForm {...commonProps} />
          </ResumeContext.Provider>
        );
      case "summary":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <SummaryForm {...commonProps} />
          </ResumeContext.Provider>
        );
      case "experience":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <ExperienceForm {...commonProps} />
          </ResumeContext.Provider>
        );
      case "skills":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <Skills {...commonProps} />
          </ResumeContext.Provider>
        );
      case "projects":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <Projects {...commonProps} />
          </ResumeContext.Provider>
        );
      case "certifications":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <Certification {...commonProps} />
          </ResumeContext.Provider>
        );
      case "education":
        return (
          <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
            <Education {...commonProps} />
          </ResumeContext.Provider>
        );
      case "review":
        return (
          <div
            className="p-5 shadow-lg rounded-lg border-t-4 mt-10 bg-white"
            style={{ borderTopColor: "rgb(246,196,158)" }}
          >
            <h2 className="font-bold text-xl text-slate-900">
              Review & Generate Resume
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Review your information and generate your resume
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-900">
                  Resume Title
                </label>
                <Input
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  placeholder="Enter resume title"
                  className="mt-1 bg-white border-slate-300 text-slate-900"
                  style={{
                    "&:focus": {
                      borderColor: "rgb(246,196,158)",
                      boxShadow: "0 0 0 3px rgba(246,196,158,0.1)",
                    },
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgb(246,196,158)";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(246,196,158,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                    e.target.style.boxShadow = "";
                  }}
                />
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  background:
                    "linear-gradient(to right, rgba(246,196,158,0.1), rgba(255,228,196,0.1))",
                  borderColor: "rgba(246,196,158,0.3)",
                }}
              >
                <h3
                  className="font-medium mb-2"
                  style={{ color: "rgb(139,69,19)" }}
                >
                  Selected Template: {template?.name}
                </h3>
                <p className="text-sm" style={{ color: "rgb(160,82,45)" }}>
                  {template?.description}
                </p>
              </div>
            </div>

            <Button
              onClick={generateResumeWithAI}
              disabled={loading || !resumeTitle}
              className="w-full text-black shadow-lg"
              style={{
                background:
                  "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))",
              }}
              onMouseEnter={(e) => {
                if (!loading && resumeTitle) {
                  e.target.style.background =
                    "linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && resumeTitle) {
                  e.target.style.background =
                    "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))";
                }
              }}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {resumeId ? "Updating Resume..." : "Generating Resume..."}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {resumeId ? "Update Resume" : "Create Resume"}
                </>
              )}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (!template) {
    return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;
  }

  return (
    <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Back to Dashboard Link */}
          <div className="text-center mb-8">
            <Link
              to="/dashboard"
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 p-4 sm:p-6 lg:p-10 gap-6 lg:gap-10">
            {/* Left Column - Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 border border-slate-200">
              {/* Navigation Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div className="gap-3 hidden sm:flex">
                  <Link to="/create/templates">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-slate-50"
                    >
                      <Home className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  {activeSection > 1 && (
                    <Button
                      size="sm"
                      onClick={handlePrevious}
                      variant="outline"
                      className="bg-white border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                  {/* Hide Next button on review page in mobile view, show on desktop */}
                  {activeSection < formSections.length && (
                    <Button
                      onClick={handleNext}
                      disabled={!enableNext}
                      className={`gap-2 text-black ${
                        activeSection === 7 ? "hidden sm:flex" : "flex"
                      }`}
                      style={{
                        background:
                          "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))",
                        "&:hover": {
                          background:
                            "linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))",
                        },
                      }}
                      size="sm"
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))";
                      }}
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-slate-100">
                {renderFormSection()}
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 border border-slate-200">
              <h2 className="font-bold text-xl mb-4 text-slate-900">
                Template Preview
              </h2>
              <div
                className="h-64 sm:h-80 lg:h-96 rounded-lg flex items-center justify-center border border-slate-200"
                style={{
                  background:
                    "linear-gradient(to bottom right, rgba(246,196,158,0.1), rgba(255,228,196,0.1))",
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <h3 className="font-semibold text-lg text-slate-900">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 px-4">
                    {template.description}
                  </p>
                  <div className="mt-4 text-xs text-slate-500">
                    Preview will be available after generation
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resume Limit Reached Dialog */}
          <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
            <AlertDialogContent className="bg-white border-slate-200 shadow-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 text-xl font-semibold">
                  Resume Limit Reached
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-600">
                  <div className="space-y-3">
                    <p>
                      You have reached the maximum limit of{" "}
                      <span className="font-semibold text-slate-900">
                        3 resumes
                      </span>
                      .
                    </p>
                    <p>
                      To create a new resume, please delete an existing one from
                      your dashboard first.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => {
                    setShowLimitDialog(false);
                    navigate("/dashboard");
                  }}
                  className="text-black"
                  style={{
                    background:
                      "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background =
                      "linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background =
                      "linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))";
                  }}
                >
                  Go to Dashboard
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </ResumeContext.Provider>
  );
};

export default TemplateForm;
