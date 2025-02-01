import Header from "@/components/custom/Header";
import { AtomIcon, Edit, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Globe } from "react-feather";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStartedButton = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="z-50">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
          <div
            className="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
            role="alert"
          >
            <span className="text-xs bg-primary rounded-full text-white px-4 py-1.5 mr-3">
              New
            </span>
            <span className="text-sm font-medium">
              AI-Enhanced Resume Creation
            </span>
            <svg
              className="ml-2 w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-foreground md:text-5xl lg:text-6xl">
            Elevate Your Career with Smart Resume Creation
          </h1>
          <p className="mb-8 text-lg font-normal text-muted-foreground lg:text-xl sm:px-16 xl:px-48">
            Effortlessly Craft a Standout Resume with Our AI-Powered Builder
          </p>
          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <div
              onClick={handleGetStartedButton}
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary hover:bg-primary/90 focus:ring-4 focus:ring-primary/30"
            >
              Get Started
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section className="py-8 bg-card z-50 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
        <h2 className="font-bold text-3xl text-card-foreground">
          How it Works?
        </h2>
        <h2 className="text-md text-muted-foreground">
          Create your resume quickly and effortlessly in 3 Steps
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="block rounded-xl border bg-card border-border p-8 shadow-xl transition hover:shadow-lg">
            <AtomIcon className="h-10 w-10 m-auto text-foreground" />
            <h2 className="mt-4 text-xl font-bold text-card-foreground">
              Quickly customize your resume with AI
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Simply input your experience, and let our AI generate impactful
              bullet points that showcase your skill and experience.
            </p>
          </div>

          <div className="block rounded-xl border bg-card border-border p-8 shadow-xl transition hover:shadow-lg">
            <Edit className="h-10 w-10 m-auto text-foreground" />
            <h2 className="mt-4 text-xl font-bold text-card-foreground">
              Personalize Your Content
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Modify your form as per your requirements. Change colors,
              customize AI-generated data, and tailor it to suit your needs.
            </p>
          </div>

          <div className="block rounded-xl border bg-card border-border p-8 shadow-xl transition hover:shadow-lg">
            <Share2 className="h-10 w-10 m-auto text-foreground" />
            <h2 className="mt-4 text-xl font-bold text-card-foreground">
              Resume-Specific Platforms
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Download your resume in PDF format and easily share it with others
              using a unique URL. Start accepting responses and feedback
              promptly.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="inline-block rounded bg-primary px-12 py-3 text-sm font-medium text-white transition hover:bg-primary/90 focus:outline-none focus:ring focus:ring-primary/30">
            Get Started Now
          </button>

          <footer className="bg-card py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center space-x-6">
                  <a
                    href="https://www.instagram.com/victus__13/"
                    className="text-muted-foreground hover:text-pink-500 transition"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="http://linkedin.com/in/mohamed-jameel823"
                    className="text-muted-foreground hover:text-blue-500 transition"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                  <a
                    href="https://jameel-portfolio.vercel.app"
                    className="text-muted-foreground hover:text-green-500 transition"
                  >
                    <Globe className="h-6 w-6" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground">
                  This site is crafted with React by{" "}
                  <span className="font-bold">Mohamed Jameel</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default Home;
