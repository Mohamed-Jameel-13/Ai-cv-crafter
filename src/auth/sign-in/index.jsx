import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../utils/firebase_config";
import { useUser } from "../../context/UserContext";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleIcon } from "@/components/ui/icons";
import { Link } from "react-router-dom";

// Reusable animated blob component from the landing page for consistency
const MorphingBlob = ({ className = "" }) => (
  <motion.div
    className={`absolute rounded-full filter blur-3xl opacity-30 mix-blend-multiply ${className}`}
    animate={{
      scale: [1, 1.2, 0.8, 1.1, 1],
      rotate: [0, 90, 180, 270, 0],
    }}
    transition={{
      duration: 30,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      login(result.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      // You might want to show a toast notification here
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Blobs */}
      <MorphingBlob className="top-10 -left-40 w-[350px] h-[350px] bg-amber-200" />
      <MorphingBlob className="bottom-10 -right-40 w-[350px] h-[350px] bg-orange-200" />
      <MorphingBlob className="bottom-1/2 right-1/2 w-[250px] h-[250px] bg-yellow-200" />

      {/* Login Card */}
      <motion.div
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-amber-200/50 p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="mb-6">
             <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl font-bold text-amber-900 mb-3"
          >
            Welcome Back
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={itemVariants}
            className="text-amber-700/80 mb-8 max-w-xs mx-auto"
          >
            Sign in to continue managing your AI-powered resumes.
          </motion.p>

          {/* Google Sign-in Button */}
          <motion.div variants={itemVariants} className="w-full">
            <motion.button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-amber-50/50 border border-amber-200/80 text-amber-900 font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300"
              whileHover={{ scale: 1.02, y: -3, boxShadow: "0px 10px 20px rgba(0,0,0,0.05)" }}
              whileTap={{ scale: 0.98 }}
            >
              <GoogleIcon className="w-5 h-5" />
              Continue with Google
            </motion.button>
          </motion.div>

           {/* Terms of Service */}
           <motion.p variants={itemVariants} className="text-xs text-amber-700/60 mt-8">
            By continuing, you agree to our{" "}
            <Link to="/terms-of-service" className="underline hover:text-amber-800">
              Terms of Service
            </Link>
            .
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignInPage;
