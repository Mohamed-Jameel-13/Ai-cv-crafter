import { Loader2, PlusSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

const AddResume = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [resumeTitle, setResumeTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const db = getFirestore();

  const onCreate = async () => {
    if (!user?.uid || !resumeTitle) {
      console.error("User is not authenticated or title is missing.");
      return;
    }

    setLoading(true);
    try {
      const resumesRef = collection(db, "usersByEmail", user.email, "resumes");

      const q = query(resumesRef, orderBy("resumeId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let newResumeId = 1;
      if (!querySnapshot.empty) {
        const lastResume = querySnapshot.docs[0].data();
        newResumeId = (lastResume.resumeId || 0) + 1;
      }

      const resumeData = {
        resumeId: newResumeId,
        title: resumeTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email,
        data: {
          basics: {},
          work: [],
          education: [],
          skills: [],
          projects: [],
        },
      };

      const resumeDocRef = doc(resumesRef, `resume-${newResumeId}`);
      await setDoc(resumeDocRef, resumeData);

      console.log("Resume created successfully!");
      setLoading(false);
      setOpenDialog(false);
      navigate(`/dashboard/${user.email}/${newResumeId}/edit`);
    } catch (error) {
      console.error("Error creating resume:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div
            className="flex rounded-xl border-2 border-dashed bg-card border-foreground/20 p-8 shadow-xl transition hover:shadow-lg hover:scale-105 cursor-pointer h-[280px] items-center justify-center"
          >
            <PlusSquare className="h-20 w-20 text-muted-foreground" />
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
                className="text-foreground hover:bg-muted border-2"
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
    </div>
  );
};

export default AddResume;
