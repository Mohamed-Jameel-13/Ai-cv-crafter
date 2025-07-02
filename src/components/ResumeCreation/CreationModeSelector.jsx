import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles, ArrowRight, Home, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/custom/Header';
import { useState, useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import { Input } from '@/components/ui/input';
import EncryptedFirebaseService from '@/utils/firebase_encrypted';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CreationModeSelector = () => {
  const navigate = useNavigate();
  const [showDefaultDialog, setShowDefaultDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const handleDefaultResume = () => {
    // Show dialog to get resume title instead of just navigating to dashboard
    setShowDefaultDialog(true);
  };

  const createDefaultResume = async () => {
    if (!user?.uid || !resumeTitle) {
      console.error("User is not authenticated or title is missing.");
      return;
    }

    setLoading(true);
    try {
      const resumeData = {
        title: resumeTitle,
        userId: user.uid,
        userEmail: user.email,
        personalDetail: {},
        summary: '',
        experience: [],
        skills: [],
        projects: [],
        education: []
      };

      const result = await EncryptedFirebaseService.createNewResume(user.email, resumeData);

      console.log("Encrypted resume created successfully!");
      setShowDefaultDialog(false);
      setResumeTitle("");
      navigate(`/dashboard/${user.email}/${result.resumeId}/edit`);
    } catch (error) {
      console.error("Error creating encrypted resume:", error);
      
      if (error.message === 'RESUME_LIMIT_REACHED') {
        setShowDefaultDialog(false);
        setShowLimitDialog(true);
      } else {
        // Handle other errors
        console.error("Other error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateResume = () => {
    navigate('/create/templates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
            Create Your Resume
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Choose how you'd like to create your resume. Start from scratch or use our professional templates.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
          {/* Default Resume Card */}
                      <Card className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-[rgb(63,39,34)] bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center pb-4 p-4 sm:p-6">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-md">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Default Resume Builder
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base">
                Build your resume step by step with complete control
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-4 sm:p-6 pt-0">
              <ul className="text-sm sm:text-base text-slate-600 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                  Complete creative control
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                  AI-powered content generation
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                  Step-by-step form guidance
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                  Traditional resume workflow
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                  Perfect for any industry
                </li>
              </ul>
              <Button 
                onClick={handleDefaultResume}
                className="w-full text-black transition-all duration-300 shadow-md hover:shadow-lg h-11 sm:h-12"
                style={{ 
                  background: 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))';
                }}
              >
                Start Building
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Template Resume Card */}
                      <Card className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-[rgb(63,39,34)] bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center pb-4 p-4 sm:p-6">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-md">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Template-Based Resume
              </CardTitle>
              <CardDescription className="text-slate-600 text-sm sm:text-base">
                Choose from professional templates with AI generation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-4 sm:p-6 pt-0">
              <ul className="text-sm sm:text-base text-slate-600 space-y-2 text-left">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  Professional template styles
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  AI generates LaTeX code
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  ATS-optimized designs
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  Professional PDF output
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></span>
                  Instant generation
                </li>
              </ul>
              <Button 
                onClick={handleTemplateResume}
                className="w-full text-white transition-all duration-300 shadow-md hover:shadow-lg h-11 sm:h-12"
                style={{ 
                  backgroundColor: 'rgb(63,39,34)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgb(53,29,24)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgb(63,39,34)';
                }}
              >
                Browse Templates
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Dashboard Link */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <Link to="/dashboard">
                          <Button variant="outline" className="inline-flex items-center bg-white/80 backdrop-blur-sm hover:bg-white border-slate-300 hover:border-[rgb(63,39,34)] text-slate-700 hover:text-slate-900 shadow-md hover:shadow-lg transition-all duration-300">
              <Home className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Default Resume Creation Dialog */}
      <Dialog open={showDefaultDialog} onOpenChange={setShowDefaultDialog}>
        <DialogContent className="bg-white border-slate-200 shadow-xl max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-xl font-semibold">
              Create New Resume
            </DialogTitle>
            <DialogDescription>
              <p className="text-slate-600 mb-4">
                Add a title for your new resume
              </p>
              <Input
                className="bg-white border-slate-300 text-slate-900"
                style={{
                  '&:focus': {
                    borderColor: 'rgb(246,196,158)',
                    boxShadow: '0 0 0 3px rgba(246,196,158,0.1)'
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgb(246,196,158)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(246,196,158,0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
                placeholder="Ex. Full Stack Developer"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </DialogDescription>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowDefaultDialog(false);
                  setResumeTitle('');
                }}
                variant="ghost"
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 hover:border-[rgb(63,39,34)]"
              >
                Cancel
              </Button>
              <Button
                disabled={!resumeTitle || loading}
                onClick={createDefaultResume}
                className="text-black"
                style={{ 
                  background: 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))'
                }}
                onMouseEnter={(e) => {
                  if (!loading && resumeTitle) {
                    e.target.style.background = 'linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && resumeTitle) {
                    e.target.style.background = 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))';
                  }
                }}
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create"}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Resume Limit Reached Dialog */}
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent className="bg-white border-slate-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-xl font-semibold">
              Resume Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              <div className="space-y-3">
                <p>You have reached the maximum limit of <span className="font-semibold text-slate-900">3 resumes</span>.</p>
                <p>To create a new resume, please delete an existing one from your dashboard first.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowLimitDialog(false)}
              className="text-black"
              style={{ 
                background: 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(to right, rgb(236,186,148), rgb(226,176,138))';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(to right, rgb(246,196,158), rgb(236,186,148))';
              }}
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CreationModeSelector; 