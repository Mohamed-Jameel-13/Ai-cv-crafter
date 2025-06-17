import Header from "@/components/custom/Header";
import { Button } from "@/components/ui/button"; // Use Shadcn Button
import { ArrowRight, BrainCircuit, Edit3, Share2 } from "lucide-react"; // Updated icons, replaced ShareNetwork with Share2
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Globe } from "react-feather";
import { motion } from "framer-motion"; // Import motion

const Home = () => {
  const navigate = useNavigate();

  const handleGetStartedButton = () => {
    navigate("/dashboard");
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const featureCardVariants = {
     hidden: { opacity: 0, scale: 0.95, y: 30 },
     visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      {/* Hero Section */}
      <motion.section
        className="flex-grow flex items-center justify-center text-center px-6 sm:px-4 py-16 md:py-24 lg:py-32 z-10 bg-background text-foreground"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeIn}>
            <span className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text text-sm font-semibold mb-4 px-3 py-1 rounded-full border border-primary/20 shadow-sm">
              ✨ AI-Powered Resume Magic
            </span>
          </motion.div>
          <motion.h1
            className="mb-6 text-4xl font-extrabold tracking-tight leading-tight md:text-5xl lg:text-6xl"
            variants={fadeIn}
          >
            Craft Your Future:{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
              Smarter Resumes
            </span>
            , Faster.
          </motion.h1>
          <motion.p
            className="mb-10 text-lg font-normal lg:text-xl sm:px-16"
            variants={fadeIn}
          >
            Leverage AI to build compelling resumes that stand out. Effortless
            creation, professional results.
          </motion.p>
          <motion.div variants={fadeIn}>            <Button
              size="lg"
              onClick={handleGetStartedButton}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white !text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section
        className="py-16 md:py-24 bg-background text-foreground px-6 sm:px-4 z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-screen-xl mx-auto text-center">
          <motion.h2 className="font-bold text-3xl mb-3" variants={fadeIn}>
            How It Works
          </motion.h2>
          <motion.p className="text-md mb-12" variants={fadeIn}>
            Create your perfect resume in 3 simple steps.
          </motion.p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature Card 1 */}
            <motion.div
              className="flex flex-col items-center p-8 rounded-xl border border-border bg-white text-black shadow-lg transition-shadow hover:shadow-xl"
              variants={featureCardVariants}
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 mb-4">
                 <BrainCircuit className="h-10 w-10 text-pink-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-black">
                AI-Powered Content
              </h3>
              <p className="mt-2 text-sm text-gray-700 text-center">
                Input your details, and our AI generates impactful descriptions
                tailored to your experience.
              </p>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              className="flex flex-col items-center p-8 rounded-xl border border-border bg-white text-black shadow-lg transition-shadow hover:shadow-xl"
              variants={featureCardVariants}
            >
               <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-green-100 mb-4">
                 <Edit3 className="h-10 w-10 text-blue-500" />
               </div>
              <h3 className="mt-4 text-xl font-bold text-black">
                Customize & Refine
              </h3>
              <p className="mt-2 text-sm text-gray-700 text-center">
                Easily edit AI suggestions, choose templates, and personalize
                colors to match your style.
              </p>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              className="flex flex-col items-center p-8 rounded-xl border border-border bg-white text-black shadow-lg transition-shadow hover:shadow-xl"
              variants={featureCardVariants}
            >
              <div className="p-4 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mb-4">
                 <Share2 className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-black">
                Download & Share
              </h3>
              <p className="mt-2 text-sm text-gray-700 text-center">
                Get your resume as a PDF or share it online with a unique link.
                Ready for applications!
              </p>
            </motion.div>
          </div>

          <motion.div className="mt-16" variants={fadeIn}>
            <Button
              size="lg"
              onClick={handleGetStartedButton}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
            >
              Start Building Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-background text-foreground py-8 mt-auto z-10">
        <div className="container mx-auto px-6 sm:px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-6">
              <motion.a
                href="https://www.instagram.com/victus__13/"
                className="hover:text-pink-500 transition"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="http://linkedin.com/in/mohamed-jameel823"
                className="hover:text-blue-500 transition"
                 whileHover={{ scale: 1.2, rotate: -5 }}
                 whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="https://jameel-portfolio.vercel.app"
                className="hover:text-green-500 transition"
                 whileHover={{ scale: 1.2 }}
                 whileTap={{ scale: 0.9 }}
              >
                <Globe className="h-6 w-6" />
              </motion.a>
            </div>
            <p className="text-sm">
              Crafted with ❤️ using React & Framer Motion by{" "}
              <span className="font-semibold">Mohamed Jameel</span>
            </p>
             <p className="text-xs">
               &copy; {new Date().getFullYear()} AI Resume Crafter. All rights reserved.
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
