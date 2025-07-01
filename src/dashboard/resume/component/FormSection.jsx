import { Button } from "@/components/ui/button";
import PersonalDetailForm from "./form/PersonalDetailForm";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";
import { useState } from "react";
import SummaryForm from "./form/SummaryForm";
import ExperienceForm from "./form/ExperienceForm";
import Education from "./form/Education";
import Skills from "./form/Skills";
import Projects from "./form/Projects";
import { Link, Navigate, useParams } from "react-router-dom";
import ThemeColor from "./ThemeColor";

const FormSection = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [enableNext, setEnableNext] = useState(true);
  const { resumeId, email } = useParams(); 

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-5">
          <Link to={"/dashboard"} className="hidden sm:block">
            <Button>
              <Home />
            </Button>
          </Link>
          <ThemeColor/>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {activeIndex > 1 && (
            <Button
              size="sm"
              onClick={() => setActiveIndex(activeIndex - 1)}
              className=""
            >
              <ArrowLeft className="mr-2" />
              Previous
            </Button>
          )}
          {/* Hide Next button on final section (6) in mobile view, show on desktop */}
          {activeIndex < 7 && (
            <Button
              onClick={() => setActiveIndex(activeIndex + 1)}
              disabled={!enableNext}
              className={`gap-2 ${
                activeIndex === 6 ? 'hidden sm:flex' : 'flex'
              }`}
              size="sm"
            >
              Next <ArrowRight />
            </Button>
          )}
        </div>
      </div>

      {/* Keep all components mounted but hide inactive ones */}
      <div style={{ display: activeIndex === 1 ? 'block' : 'none' }}>
        <PersonalDetailForm
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>
      
      <div style={{ display: activeIndex === 2 ? 'block' : 'none' }}>
        <SummaryForm
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>
      
      <div style={{ display: activeIndex === 3 ? 'block' : 'none' }}>
        <ExperienceForm
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>
      
      <div style={{ display: activeIndex === 4 ? 'block' : 'none' }}>
        <Skills
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>
      
      <div style={{ display: activeIndex === 5 ? 'block' : 'none' }}>
        <Projects
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>
      
      <div style={{ display: activeIndex === 6 ? 'block' : 'none' }}>
        <Education
          resumeId={resumeId}
          email={email}
          enableNext={(v) => setEnableNext(v)}
        />
      </div>

      {activeIndex === 7 && (
        <Navigate to={`/dashboard/${email}/${resumeId}/view`} />
      )}
    </div>
  );
};

export default FormSection;
