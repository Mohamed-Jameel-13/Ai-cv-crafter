import Header from "@/components/custom/Header";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Edit3, Share2, CheckCircle, Users, Trophy, Zap, Star, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Globe } from "react-feather";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStartedButton = () => {
    navigate("/dashboard");
  };

  // Animation variants - Smooth and elegant
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smooth feel
      } 
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
        ease: "easeOut",
      },
    },
  };

  const featureCardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      rotateX: 15
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: { 
        duration: 0.7, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      } 
    }
  };

  const cardHover = {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-violet-300/20 to-purple-300/20 rounded-full blur-2xl"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-300/20 to-rose-300/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-indigo-300/20 to-violet-300/20 rounded-full blur-xl"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf610_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf610_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <motion.section
        className="flex-grow flex items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 relative z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto">

          <motion.div variants={fadeIn}>
            <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-700 text-sm font-semibold mb-6 px-4 py-2 rounded-full border border-slate-200/50 shadow-lg">
              <Zap className="w-4 h-4 text-yellow-500" />
              AI-Powered Resume Magic
              <Star className="w-4 h-4 text-yellow-500" />
            </span>
          </motion.div>
          
          <motion.h1
            className="mb-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight"
            variants={fadeIn}
          >
            Build Your Dream Resume{" "}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-transparent bg-clip-text">
              10x Faster
            </span>
          </motion.h1>
          
          <motion.p
            className="mb-10 text-lg sm:text-xl lg:text-2xl font-medium text-slate-600 max-w-3xl mx-auto leading-relaxed"
            variants={fadeIn}
          >
            Transform your career with AI-powered resume creation. 
            <br className="hidden sm:block" />
            Professional templates, smart suggestions, instant results.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12" variants={fadeIn}>
            <Button
              size="lg"
              onClick={handleGetStartedButton}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl text-lg"
            >
              Create Your Resume Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* How it Works Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4" variants={fadeIn}>
              How It Works
            </motion.h2>
            <motion.p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto" variants={fadeIn}>
              Create your perfect resume in just 3 simple steps. No design skills required.
            </motion.p>
          </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
             {/* Step 1 */}
             <motion.div
               className="relative group"
               variants={featureCardVariants}
               whileHover={cardHover}
             >
               <motion.div 
                 className="h-full min-h-[280px] md:min-h-[320px] lg:min-h-[380px] bg-slate-100 rounded-[30px] md:rounded-[40px] lg:rounded-[50px] p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden"
                 style={{
                   boxShadow: `
                     rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
                     rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
                     rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
                     rgba(0, 0, 0, 0.06) 0px 2px 1px,
                     rgba(0, 0, 0, 0.09) 0px 4px 2px,
                     rgba(0, 0, 0, 0.09) 0px 8px 4px,
                     rgba(0, 0, 0, 0.09) 0px 16px 8px,
                     rgba(0, 0, 0, 0.09) 0px 32px 16px
                   `
                 }}
               >
                 <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
                   1
                 </div>
                 <div className="p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 mb-3 md:mb-4 lg:mb-6 w-fit">
                   <BrainCircuit className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-violet-600" />
                 </div>
                 <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800 mb-2 md:mb-3 lg:mb-4">
                   AI-Powered Content
                 </h3>
                 <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                   Input your details and our AI generates compelling, ATS-friendly content that makes you stand out to employers.
                 </p>
               </motion.div>
             </motion.div>

             {/* Step 2 */}
             <motion.div
               className="relative group"
               variants={featureCardVariants}
               whileHover={cardHover}
             >
               <motion.div 
                 className="h-full min-h-[280px] md:min-h-[320px] lg:min-h-[380px] bg-slate-100 rounded-[30px] md:rounded-[40px] lg:rounded-[50px] p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden"
                 style={{
                   boxShadow: `
                     rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
                     rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
                     rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
                     rgba(0, 0, 0, 0.06) 0px 2px 1px,
                     rgba(0, 0, 0, 0.09) 0px 4px 2px,
                     rgba(0, 0, 0, 0.09) 0px 8px 4px,
                     rgba(0, 0, 0, 0.09) 0px 16px 8px,
                     rgba(0, 0, 0, 0.09) 0px 32px 16px
                   `
                 }}
               >
                 <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
                   2
                 </div>
                 <div className="p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 mb-3 md:mb-4 lg:mb-6 w-fit">
                   <Edit3 className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-blue-600" />
                 </div>
                 <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800 mb-2 md:mb-3 lg:mb-4">
                   Customize & Perfect
                 </h3>
                 <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                   Choose professional templates, customize colors and fonts. Real-time preview shows exactly how your resume will look.
                 </p>
               </motion.div>
             </motion.div>

             {/* Step 3 */}
             <motion.div
               className="relative group"
               variants={featureCardVariants}
               whileHover={cardHover}
             >
               <motion.div 
                 className="h-full min-h-[280px] md:min-h-[320px] lg:min-h-[380px] bg-slate-100 rounded-[30px] md:rounded-[40px] lg:rounded-[50px] p-4 sm:p-6 md:p-8 lg:p-10 relative overflow-hidden"
                 style={{
                   boxShadow: `
                     rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
                     rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
                     rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
                     rgba(0, 0, 0, 0.06) 0px 2px 1px,
                     rgba(0, 0, 0, 0.09) 0px 4px 2px,
                     rgba(0, 0, 0, 0.09) 0px 8px 4px,
                     rgba(0, 0, 0, 0.09) 0px 16px 8px,
                     rgba(0, 0, 0, 0.09) 0px 32px 16px
                   `
                 }}
               >
                 <div className="absolute -top-2 -left-2 md:-top-4 md:-left-4 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
                   3
                 </div>
                 <div className="p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 mb-3 md:mb-4 lg:mb-6 w-fit">
                   <Download className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-green-600" />
                 </div>
                 <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-slate-800 mb-2 md:mb-3 lg:mb-4">
                   Download & Apply
                 </h3>
                 <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                   Export as high-quality PDF or share with unique link. Your professional resume is ready for applications in minutes.
                 </p>
               </motion.div>
             </motion.div>
           </div>

          <motion.div className="text-center mt-16" variants={fadeIn}>
            <Button
              size="lg"
              onClick={handleGetStartedButton}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-xl transform transition-all duration-200 hover:scale-105 text-lg"
            >
              Start Building Your Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 mb-4" variants={fadeIn}>
              Why Choose AI Resume Crafter?
            </motion.h2>
            <motion.p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto" variants={fadeIn}>
              Join thousands of professionals who have accelerated their career with our AI-powered platform
            </motion.p>
          </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               {
                 icon: CheckCircle,
                 title: "ATS-Optimized",
                 description: "All templates are designed to pass Applicant Tracking Systems",
                 color: "from-green-500 to-emerald-500"
               },
               {
                 icon: Zap,
                 title: "Lightning Fast",
                 description: "Create professional resumes in under 10 minutes",
                 color: "from-yellow-500 to-orange-500"
               },
               {
                 icon: Users,
                 title: "Industry Experts",
                 description: "Templates reviewed by hiring managers and recruiters",
                 color: "from-blue-500 to-cyan-500"
               },
               {
                 icon: Trophy,
                 title: "Proven Results",
                 description: "95% of users report increased interview callbacks",
                 color: "from-purple-500 to-pink-500"
               },
               {
                 icon: Share2,
                 title: "Easy Sharing",
                 description: "Share your resume instantly with unique shareable links",
                 color: "from-indigo-500 to-purple-500"
               },
               {
                 icon: Star,
                 title: "Premium Quality",
                 description: "Professional designs that make lasting impressions",
                 color: "from-rose-500 to-pink-500"
               }
             ].map((benefit, index) => (
               <motion.div
                 key={index}
                 variants={featureCardVariants}
                 whileHover={cardHover}
               >
                 <motion.div
                   className="h-full min-h-[220px] md:min-h-[260px] lg:min-h-[280px] bg-slate-100 rounded-[25px] md:rounded-[35px] lg:rounded-[50px] p-4 sm:p-5 md:p-6 lg:p-8 relative overflow-hidden"
                   style={{
                     boxShadow: `
                       rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset,
                       rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset,
                       rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset,
                       rgba(0, 0, 0, 0.06) 0px 2px 1px,
                       rgba(0, 0, 0, 0.09) 0px 4px 2px,
                       rgba(0, 0, 0, 0.09) 0px 8px 4px,
                       rgba(0, 0, 0, 0.09) 0px 16px 8px,
                       rgba(0, 0, 0, 0.09) 0px 32px 16px
                     `
                   }}
                 >
                 <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${benefit.color} mb-3 md:mb-4 w-fit`}>
                   <benefit.icon className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
                 </div>
                 <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2 md:mb-3">
                   {benefit.title}
                 </h3>
                 <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                   {benefit.description}
                 </p>
                 </motion.div>
               </motion.div>
             ))}
           </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center">
                     <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute inset-0 opacity-20">
               <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
             </div>
            
            <motion.div className="relative z-10" variants={fadeIn}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Land Your Dream Job?
              </h2>
              <p className="text-lg sm:text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
                Join over 10,000 professionals who have successfully crafted winning resumes with our AI-powered platform.
              </p>
              <Button
                size="lg"
                onClick={handleGetStartedButton}
                className="bg-white text-violet-600 hover:bg-gray-50 font-bold py-4 px-8 rounded-full shadow-xl transform transition-all duration-200 hover:scale-105 text-lg"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-violet-200 text-sm mt-4">
                No credit card required • Create unlimited resumes
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center space-x-8">
              <motion.a
                href="https://www.instagram.com/victus__13/"
                className="text-slate-600 hover:text-pink-500 transition-colors duration-200"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="http://linkedin.com/in/mohamed-jameel823"
                className="text-slate-600 hover:text-blue-500 transition-colors duration-200"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="https://mohamedjameel.me"
                className="text-slate-600 hover:text-green-500 transition-colors duration-200"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Globe className="h-6 w-6" />
              </motion.a>
            </div>
            <div className="text-center">
              <p className="text-slate-600 mb-2">
                Crafted with ❤️ using React by{" "}
                <span className="font-semibold text-slate-800">Mohamed Jameel</span>
              </p>
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} AI Resume Crafter. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
