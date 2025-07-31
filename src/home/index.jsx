import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BrainCircuit,
  Edit3,
  Share2,
  CheckCircle,
  Users,
  Trophy,
  Zap,
  Star,
  Download,
  Eye,
  Shield,
  Sparkles,
  FileText,
  Layers,
  Clock,
  BarChart3,
  Palette,
  Globe,
  HeartHandshake,
  ChevronDown,
  Play,
  Check,
  Plus,
  ArrowUpRight,
  MousePointer,
  Cpu,
  Code,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Globe as GlobeIcon } from "react-feather";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import AdUnit from "@/components/AdUnit";
// Add useMediaQuery for mobile detection
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const Home = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  
  // Advanced scroll animations
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '200%']);
  
  // Mouse tracking for interactive elements
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 700 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  const handleGetStartedButton = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Auto-rotate features with enhanced timing
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const float = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const features = [
    {
      icon: BrainCircuit,
      title: "AI-Powered Generation",
      description: "Advanced AI creates LaTeX resumes with professional formatting and ATS optimization",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Layers,
      title: "Dual Creation Modes",
      description: "Choose between quick template generation or detailed form-based building with live preview",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Encrypted & Secure",
      description: "Your data is encrypted and stored securely with enterprise-grade Firebase security",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Sparkles,
      title: "Smart AI Assistance", 
      description: "Get AI suggestions for summaries, bullet points, skills, and project descriptions",
      color: "from-pink-500 to-purple-500",
    },
  ];

  const stats = [
    { number: "10x", label: "Faster Creation", icon: Rocket },
    { number: "99%", label: "ATS Compatibility", icon: CheckCircle },
    { number: "100%", label: "Encrypted Data", icon: FileText },
    { number: "24/7", label: "AI Assistance", icon: Cpu },
  ];



  // 3D Resume Card Component
  const Resume3DCard = ({ index, isActive }) => (
    // Hide 3D cards on mobile for performance
    !isMobile && !prefersReducedMotion ? (
      <motion.div
        className="absolute w-32 h-40 bg-white rounded-lg shadow-2xl border border-amber-200"
        style={{
          rotateY: isActive ? 0 : 45,
          rotateX: isActive ? 0 : 15,
          z: isActive ? 100 : 50 - index * 10,
          x: index * 40,
          y: index * 20,
        }}
        animate={{
          rotateY: isActive ? [0, 5, 0] : 45,
          rotateX: isActive ? [0, -2, 0] : 15,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={{
          rotateY: 0,
          rotateX: 0,
          scale: 1.1,
          z: 200,
        }}
      >
        <div className="p-3 space-y-2">
          <div className="h-3 bg-amber-200 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-1">
            <div className="h-1 bg-gray-100 rounded"></div>
            <div className="h-1 bg-gray-100 rounded w-5/6"></div>
            <div className="h-1 bg-gray-100 rounded w-4/5"></div>
          </div>
        </div>
      </motion.div>
    ) : null
  );

  // Morphing blob background
  const MorphingBlob = ({ className = "" }) => (
    // Hide morphing blobs on mobile for performance
    !isMobile && !prefersReducedMotion ? (
      <motion.div
        className={`absolute rounded-full blur-3xl ${className}`}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          borderRadius: ["50%", "40%", "50%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    ) : null
  );

  // Interactive typing animation
  const TypingDemo = () => {
    const [text, setText] = useState("");
    const fullText = "Experienced Software Engineer with 5+ years developing scalable web applications...";
    
    useEffect(() => {
      let i = 0;
      const timer = setInterval(() => {
        setText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) {
          i = 0;
          setText("");
        }
      }, 100);
      
      return () => clearInterval(timer);
    }, [fullText]);
    
    return (
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-400">AI Resume Generator</span>
        </div>
        <div>
          <span className="text-blue-400">$</span> {text}
          <span className="animate-pulse">|</span>
        </div>
      </div>
    );
  };

  // Mobile and reduced motion detection
  const isMobile = useMediaQuery("(max-width: 640px)");
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" ref={containerRef}>
      {/* Advanced Dynamic Background */}
      <div className="fixed inset-0 -z-10">
        {/* Animated mesh gradient */}
        <motion.div 
          className="absolute inset-0"
          style={{ y: !isMobile && !prefersReducedMotion ? backgroundY : 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"></div>
          {/* Morphing blobs hidden on mobile */}
          <MorphingBlob className="top-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-300/20 to-orange-300/20" />
          <MorphingBlob className="bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-orange-300/20 to-red-300/20" />
          <MorphingBlob className="top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-yellow-300/20 to-amber-300/20" />
          {/* Interactive grid hidden on mobile */}
          {!isMobile && !prefersReducedMotion && (
            <motion.div 
              className="absolute inset-0 bg-[linear-gradient(to_right,#92400e08_1px,transparent_1px),linear-gradient(to_bottom,#92400e08_1px,transparent_1px)] bg-[size:60px_60px]"
              animate={{
                backgroundPosition: ["0px 0px", "60px 60px"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Enhanced Hero Section with 3D Elements */}
      <motion.section
        className="flex-grow flex flex-col items-center justify-center text-center px-2 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 relative z-10"
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto relative">
          {/* 3D Resume Cards Background hidden on mobile */}
          <div className="absolute inset-0 pointer-events-none" style={{ perspective: "1000px" }}>
            {!isMobile && !prefersReducedMotion && [...Array(5)].map((_, i) => (
              <Resume3DCard key={i} index={i} isActive={i === 2} />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10">
            <motion.div variants={fadeInUp}>
              <motion.span 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100/80 to-orange-100/80 backdrop-blur-sm text-amber-800 text-xs sm:text-sm font-semibold mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-amber-200/50 shadow-xl"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </motion.div>
              AI-Powered Resume Magic
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 text-amber-600" />
                </motion.div>
              </motion.span>
          </motion.div>

          <motion.h1
            className="mb-6 sm:mb-8 text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              variants={fadeInUp}
            >
              Craft Your Perfect Resume{" "}
              <br className="hidden sm:block" />
              <motion.span 
                className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 text-transparent bg-clip-text"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
              10x Faster
              </motion.span>{" "}
              with AI
          </motion.h1>

          <motion.p
              className="mb-8 sm:mb-10 text-base xs:text-lg sm:text-xl lg:text-2xl font-medium text-amber-800/80 max-w-2xl sm:max-w-4xl mx-auto leading-relaxed"
              variants={fadeInUp}
          >
            Transform your career with AI-powered resume creation.
            <br className="hidden sm:block" />
              Professional LaTeX templates, smart suggestions, ATS optimization.
          </motion.p>

            {/* Enhanced Interactive Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-xs sm:max-w-4xl mx-auto"
              variants={fadeInUp}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-amber-200/50"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    boxShadow: "0 20px 40px rgba(245, 158, 11, 0.2)",
                  }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ 
                    y: { duration: 2 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
                    hover: { duration: 0.3 }
                  }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-3"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div 
                    className="text-2xl lg:text-3xl font-bold text-amber-800"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-sm lg:text-base text-amber-700/70">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={handleGetStartedButton}
                  className="bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white font-bold py-4 px-8 rounded-full shadow-xl text-lg group relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 flex items-center">
              Create Your Resume Free
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.div>
                  </span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-amber-600 text-amber-800 hover:bg-amber-50 font-semibold py-4 px-8 rounded-full shadow-lg text-lg group bg-white/80 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="mr-2 h-5 w-5" />
                  </motion.div>
                  Watch Demo
            </Button>
          </motion.div>
            </motion.div>

            {/* Interactive Feature Showcase */}
            <motion.div
              className="bg-white/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-amber-200/50 max-w-xs sm:max-w-5xl mx-auto relative overflow-hidden"
              variants={fadeInUp}
              whileHover={{ y: -5 }}
            >
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-5"
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                }}
              />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-amber-900 mb-6 text-center">
                  Experience the Power of AI
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      className={`text-center p-6 rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden ${
                        activeFeature === index
                          ? "bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 shadow-lg"
                          : "hover:bg-amber-50 border border-transparent"
                      }`}
                      whileHover={{ scale: 1.02, y: -5 }}
                      onClick={() => setActiveFeature(index)}
                      animate={{
                        scale: activeFeature === index ? [1, 1.02, 1] : 1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {/* Animated background for active state */}
                      {activeFeature === index && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-2xl"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      
                      <div className="relative z-10">
                        <motion.div
                          className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <feature.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <h4 className="font-semibold text-amber-900 text-base mb-2">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-amber-700/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Ad Unit below hero, above features, desktop/tablet only */}
      <div className="hidden sm:flex justify-center my-8">
        <AdUnit />
      </div>

      {/* Interactive AI Demo Section */}
      <motion.section
        className="py-12 sm:py-24 px-2 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-amber-900 mb-4 sm:mb-6">
              Watch AI Create Your Resume
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-amber-800/80 max-w-xs sm:max-w-3xl mx-auto">
              See how our AI transforms your basic information into a professional resume in real-time
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center"
            variants={staggerContainer}
          >
            {/* Left: Interactive Demo */}
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-amber-200/50">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <motion.div 
                      className="w-4 h-4 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-amber-800 font-medium">AI Resume Generator - Live Demo</span>
          </div>

                  <TypingDemo />
                  
                  <div className="space-y-3">
            <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-amber-800">Analyzing job requirements...</span>
                    </motion.div>
              <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2 }}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-amber-800">Generating ATS-optimized content...</span>
            </motion.div>
            <motion.div
                      className="flex items-center space-x-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 3 }}
            >
              <motion.div
                        className="w-4 h-4 border-2 border-amber-500 rounded animate-spin"
                      />
                      <span className="text-sm text-amber-800">Formatting with LaTeX...</span>
                    </motion.div>
                  </div>
                </div>
                </div>
            </motion.div>

            {/* Right: Feature List */}
            <motion.div variants={fadeInUp} className="space-y-6">
              {[
                {
                  icon: BrainCircuit,
                  title: "Intelligent Content Generation",
                  description: "AI analyzes your experience and creates compelling bullet points that highlight your achievements",
                },
                {
                  icon: Code,
                  title: "LaTeX Professional Output",
                  description: "Generate pixel-perfect PDFs using professional LaTeX formatting that recruiters love",
                },
                {
                  icon: Shield,
                  title: "ATS Optimization Built-in",
                  description: "Every resume is automatically optimized to pass Applicant Tracking Systems",
                },
                {
                  icon: Sparkles,
                  title: "Real-time Suggestions",
                  description: "Get instant AI-powered suggestions for skills, projects, and improvements",
                },
              ].map((feature, index) => (
            <motion.div
                  key={index}
                  className="flex items-start space-x-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/50 shadow-lg"
                  whileHover={{ 
                    scale: 1.02, 
                    x: 10,
                    boxShadow: "0 20px 40px rgba(245, 158, 11, 0.15)",
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
            >
              <motion.div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-xl"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      {feature.title}
                </h3>
                    <p className="text-amber-800/70">
                      {feature.description}
                </p>
                  </div>
              </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Template Showcase with 3D Effects */}
      <motion.section
        className="py-12 sm:py-24 px-2 sm:px-6 lg:px-8 relative z-10 bg-gradient-to-br from-amber-900 to-orange-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Professional Templates That Win Jobs
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-amber-200 max-w-xs sm:max-w-3xl mx-auto">
              Choose from industry-tested templates designed by experts and loved by hiring managers
            </p>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-12 border border-white/20"
            variants={fadeInUp}
            style={{ perspective: "1000px" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
              {/* 3D Template Preview */}
              <motion.div 
                className="relative"
                whileHover={{ rotateY: 5, rotateX: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-2xl transform-gpu">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <motion.div 
                        className="w-3 h-3 bg-amber-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-amber-700 font-medium uppercase tracking-wider">
                        Jake&apos;s Resume Template
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <motion.div 
                        className="h-6 bg-gradient-to-r from-amber-200 to-orange-200 rounded w-3/4"
                        animate={{ width: ["75%", "85%", "75%"] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div 
                        className="h-4 bg-amber-100 rounded w-1/2"
                        animate={{ width: ["50%", "60%", "50%"] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      />
                      
                      <div className="pt-4 space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="h-3 bg-gray-200 rounded"
                            animate={{ 
                              width: ["100%", "95%", "100%"],
                              opacity: [1, 0.8, 1] 
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: i * 0.3 
                            }}
                          />
                        ))}
                      </div>
                      
                      <div className="pt-4 space-y-2">
                        <motion.div 
                          className="h-4 bg-amber-200 rounded w-1/3"
                          animate={{ opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="space-y-1">
                          {[...Array(2)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="h-2 bg-gray-200 rounded"
                              animate={{ width: ["100%", "90%", "100%"] }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity, 
                                delay: i * 0.5 
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
          </div>

                {/* Floating badges with physics */}
              <motion.div
                  className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ATS-Optimized
                </motion.div>
                <motion.div
                  className="absolute -bottom-3 -left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold"
                  animate={{ 
                    y: [0, 5, 0],
                    rotate: [0, -5, 0] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                >
                  AI-Powered
                </motion.div>
              </motion.div>

              {/* Enhanced Features */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    The Iconic Jake&apos;s Resume
                  </h3>
                  <p className="text-amber-200 text-lg leading-relaxed">
                    The most popular LaTeX resume template, trusted by thousands of professionals worldwide. 
                    Clean, ATS-friendly, and professionally designed to get you noticed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "LaTeX Professional Output",
                    "ATS-Optimized Format", 
                    "Clean Modern Design",
                    "Industry Standard",
                    "Instant PDF Generation",
                    "Mobile Responsive",
                  ].map((feature, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                </motion.div>
                      <span className="text-amber-100">{feature}</span>
              </motion.div>
            ))}
          </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/create/templates")}
                    className="bg-white text-amber-800 hover:bg-amber-50 font-semibold py-4 px-8 rounded-2xl shadow-xl text-lg group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Explore All Templates
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Final CTA with Interactive Elements */}
      <motion.section
        className="py-12 sm:py-24 px-2 sm:px-6 lg:px-8 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="bg-gradient-to-br from-amber-800 to-orange-800 rounded-2xl sm:rounded-3xl p-6 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden"
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  background: [
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                    "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            <motion.div className="relative z-10" variants={fadeInUp}>
              <motion.h2 
                className="text-4xl sm:text-5xl font-bold text-white mb-6"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 40px rgba(255,255,255,0.3)", 
                    "0 0 20px rgba(255,255,255,0.5)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Ready to Land Your Dream Job?
              </motion.h2>
              <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                Join over 10,000 professionals who have successfully crafted winning resumes 
                with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
              <Button
                size="lg"
                onClick={handleGetStartedButton}
                    className="bg-white text-amber-800 hover:bg-amber-50 font-bold py-4 px-10 rounded-full shadow-xl text-lg group relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Get Started for Free
                      <motion.div
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-white text-white hover:bg-white hover:text-amber-800 font-semibold py-4 px-10 rounded-full shadow-lg text-lg bg-white/10 backdrop-blur-sm"
                  >
                    View Live Examples
                  </Button>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-6 text-amber-200 text-sm"
                variants={staggerContainer}
              >
                {[
                  { icon: CheckCircle, text: "No credit card required" },
                  { icon: CheckCircle, text: "Unlimited resumes" },
                  { icon: CheckCircle, text: "24/7 AI assistance" },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center space-x-2"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, delay: index }}
                    >
                      <item.icon className="w-4 h-4" />
                    </motion.div>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Footer with Animations */}
      <footer className="bg-gradient-to-r from-amber-900 to-orange-900 text-white py-8 sm:py-16 mt-auto relative z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Hide animated background on mobile */}
          {!isMobile && !prefersReducedMotion && (
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundImage: [
                  "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          )}
        </div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <motion.h3 
                className="text-2xl font-bold mb-4 text-amber-100"
                whileHover={{ scale: 1.05 }}
              >
                AI Resume Crafter
              </motion.h3>
              <p className="text-amber-200 mb-4 max-w-md">
                Empowering professionals worldwide with AI-powered resume creation. Build your future, one perfect resume at a time.
              </p>
              <div className="flex space-x-4">
              <motion.a
                href="https://www.instagram.com/victus__13/"
                  className="text-amber-200 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="http://linkedin.com/in/mohamed-jameel823"
                  className="text-amber-200 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="h-6 w-6" />
              </motion.a>
              <motion.a
                href="https://mohamedjameel.me"
                  className="text-amber-200 hover:text-white transition-colors duration-200"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                  <GlobeIcon className="h-6 w-6" />
              </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-100">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { name: "Create Resume", href: "/create" },
                  { name: "Templates", href: "/create/templates" },
                  { name: "Dashboard", href: "/dashboard" },
                  { name: "Examples", href: "#examples" },
                ].map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-amber-200 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-amber-100">Support</h4>
              <ul className="space-y-2">
                {[
                  { name: "Help Center", href: "#help" },
                  { name: "Privacy Policy", href: "#privacy" },
                  { name: "Terms of Service", href: "#terms" },
                  { name: "Contact Us", href: "#contact" },
                ].map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-amber-200 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="border-t border-amber-700 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-amber-200 mb-4 md:mb-0">
              Crafted with ❤️ using React by{" "}
              <span className="font-semibold text-amber-100">Mohamed Jameel</span>
            </p>
            <p className="text-amber-300 text-sm">
              &copy; {new Date().getFullYear()} AI Resume Crafter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
