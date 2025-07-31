import { useContext, useEffect, useState } from "react";
import ResumeItem from "./components/ResumeItem";
import { UserContext } from "@/context/UserContext";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "../utils/firebase_config";
import Logger from "@/utils/logger";
import Loader from "@/components/ui/loader";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedCreateButton from "@/components/ui/animated-create-button";
import { PlusSquare, Trash2, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdUnit from "@/components/AdUnit";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [resumeList, setResumeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  useEffect(() => {
    if (user?.email) {
      getResumesList();
    }
  }, [user]);

  // Add window focus listener to refresh data when user returns to dashboard
  useEffect(() => {
    const handleFocus = () => {
      if (user?.email) {
        Logger.log("🔄 Window focused, refreshing resume list");
        getResumesList(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const getResumesList = async (isRefresh = false) => {
    try {
      Logger.log("🔄 getResumesList called, isRefresh:", isRefresh);

      // Only show loading spinner on initial load, not on refresh after deletion
      if (!isRefresh) {
        setLoading(true);
      }

      const db = getFirestore(app);
      const resumesRef = collection(db, "usersByEmail", user.email, "resumes");
      const querySnapshot = await getDocs(resumesRef);

      const resumes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      Logger.log(
        "📊 Resumes fetched from Firestore:",
        resumes.length,
        "resumes",
      );
      setResumeList(resumes);
    } catch (error) {
      Logger.error("❌ Error fetching resumes: ", error);
    } finally {
      // Always ensure loading is set to false
      Logger.log("🔄 Setting loading to false");
      setLoading(false);
    }
  };

  // Selection functions
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedResumes([]);
  };

  const handleSelectResume = (resumeId) => {
    setSelectedResumes((prev) => {
      if (prev.includes(resumeId)) {
        return prev.filter((id) => id !== resumeId);
      } else {
        return [...prev, resumeId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedResumes.length === resumeList.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(resumeList.map((resume) => resume.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedResumes.length === 0) return;

    setIsDeleting(true);

    try {
      const db = getFirestore(app);
      const resumesRef = collection(db, "usersByEmail", user.email, "resumes");

      // Delete all selected resumes
      const deletePromises = selectedResumes.map((resumeId) => {
        const resumeRef = doc(resumesRef, resumeId);
        return deleteDoc(resumeRef);
      });

      await Promise.all(deletePromises);

      // Update local state
      setResumeList((prev) =>
        prev.filter((resume) => !selectedResumes.includes(resume.id)),
      );
      setSelectedResumes([]);
      setIsSelectionMode(false);
      setShowDeleteAlert(false);

      toast.success(
        `Successfully deleted ${selectedResumes.length} resume${selectedResumes.length > 1 ? "s" : ""}`,
      );
    } catch (error) {
      Logger.error("❌ Error deleting resumes:", error);
      toast.error("Failed to delete resumes. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Ad Unit fixed to right center for desktop only */}
      <div className="hidden lg:flex fixed right-32 top-1/2 -translate-y-1/2 z-40">
        <AdUnit />
      </div>
      <div className="p-2 sm:p-4 md:p-8 lg:p-10 md:px-4 lg:px-32 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-8 gap-4 sm:gap-6">
          <div className="flex-1">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-amber-900 mb-2">
              My Resume
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-amber-700/80">
              Start Creating AI Resume for your next job role
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto lg:flex-shrink-0">
            {resumeList.length > 0 && (
              <Button
                variant={isSelectionMode ? "default" : "outline"}
                onClick={toggleSelectionMode}
                className={`
                  w-full sm:w-auto px-4 py-2 rounded-xl transition-all duration-200 font-medium
                  ${isSelectionMode 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg' 
                    : 'border-amber-300 text-amber-800 hover:bg-amber-50 hover:border-amber-400'
                  }
                `}
              >
                {isSelectionMode ? (
                  <>
                    <Square className="mr-2 h-4 w-4" />
                    Cancel Selection
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Select Resumes
                  </>
                )}
              </Button>
            )}
            <Link to="/create" className="w-full sm:w-auto">
              <AnimatedCreateButton className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
                <PlusSquare className="mr-2 h-5 w-5" />
                <span>Create</span>
              </AnimatedCreateButton>
            </Link>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {isSelectionMode && resumeList.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="flex items-center gap-2"
                >
                  {selectedResumes.length === resumeList.length ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {selectedResumes.length === resumeList.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <span className="text-sm text-gray-600">
                  {selectedResumes.length} of {resumeList.length} selected
                </span>
              </div>
              {selectedResumes.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteAlert(true)}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedResumes.length})
                </Button>
              )}
            </div>
          </div>
        )}
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-6 sm:mt-10 gap-2 sm:gap-4 md:gap-5">
            {resumeList.length > 0 ? (
              resumeList.map((resume) => (
                <div key={resume.id}>
                  <ResumeItem
                    resume={resume}
                    refreshData={() => getResumesList(true)}
                    onDelete={(deletedResumeId) => {
                      Logger.log(
                        "🔄 Removing resume from local state:",
                        deletedResumeId,
                      );
                      setResumeList((prev) =>
                        prev.filter((r) => r.id !== deletedResumeId),
                      );
                    }}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedResumes.includes(resume.id)}
                    onSelect={() => handleSelectResume(resume.id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-12 text-center">
                <div>
                  <PlusSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No resumes found</p>
                  <p className="text-gray-400 text-sm mb-4">
                    Get started by creating your first resume
                  </p>
                  <Link to="/create">
                    <AnimatedCreateButton>
                      <PlusSquare className="mr-2 h-5 w-5" />
                      Create
                    </AnimatedCreateButton>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bulk Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Selected Resumes?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedResumes.length} resume
                {selectedResumes.length > 1 ? "s" : ""}? This action cannot be
                undone and will permanently remove{" "}
                {selectedResumes.length > 1 ? "these resumes" : "this resume"}{" "}
                from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete {selectedResumes.length} Resume
                    {selectedResumes.length > 1 ? "s" : ""}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;
