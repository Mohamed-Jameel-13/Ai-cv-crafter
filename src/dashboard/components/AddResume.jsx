import { Loader2, PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import EncryptedFirebaseService from "@/utils/firebase_encrypted";

const AddResume = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const onCreate = async () => {
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
      setOpenDialog(false);
      setResumeTitle("");
      navigate(`/dashboard/${user.email}/${result.resumeId}/edit`);
    } catch (error) {
      console.error("Error creating encrypted resume:", error);
      
      if (error.message === 'RESUME_LIMIT_REACHED') {
        setOpenDialog(false);
        setShowLimitDialog(true);
      } else {
        // Handle other errors
        console.error("Other error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div
            className="flex rounded-xl border-2 border-dashed bg-card border-foreground/20 hover:border-[rgb(63,39,34)] p-4 sm:p-6 md:p-8 shadow-xl transition hover:shadow-lg hover:scale-105 cursor-pointer h-[200px] sm:h-[240px] md:h-[260px] lg:h-[280px] items-center justify-center"
          >
            <PlusSquare className="h-12 w-12 sm:h-16 sm:w-16 md:h-18 md:w-18 lg:h-20 lg:w-20 text-muted-foreground" />
          </div>
        </DialogTrigger>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Create New Resume
            </DialogTitle>
            <DialogDescription>
              <p className="text-muted-foreground">
                Add a title for your new resume
              </p>
              <Input
                className="my-2 bg-background border-border"
                placeholder="Ex. Full Stack Developer"
                onChange={(e) => setResumeTitle(e.target.value)}
              />
            </DialogDescription>
            <div className="flex justify-end gap-5">
              <Button
                onClick={() => setOpenDialog(false)}
                variant="ghost"
                className="text-foreground hover:bg-muted hover:border-[rgb(63,39,34)] border-2"
              >
                Cancel
              </Button>
              <Button
                disabled={!resumeTitle || loading}
                onClick={onCreate}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Create"}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Resume Limit Reached Dialog */}
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground text-xl font-semibold">
              Resume Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <div className="space-y-3">
                <p>You have reached the maximum limit of <span className="font-semibold text-foreground">3 resumes</span>.</p>
                <p>To create a new resume, please delete an existing one from your dashboard first.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowLimitDialog(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddResume;
