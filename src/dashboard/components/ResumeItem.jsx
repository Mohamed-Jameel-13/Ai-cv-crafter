import {
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2Icon, MoreVertical, CheckSquare, Square, Share2, Edit3, Eye, Download, Trash2 } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getFirestore, collection, doc, deleteDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { UserContext } from "@/context/UserContext";

const ResumeItem = ({ resume, refreshData, onDelete, isSelectionMode, isSelected, onSelect }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); 
  const [openAlert, setOpenAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Utility function to restore focus and clear any stuck states
  const restoreFocusAndInteraction = () => {
    console.log("🔄 Restoring focus and clearing stuck states");
    
    // Clear any active element focus
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
    
    // Remove any stuck aria-hidden attributes
    const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    ariaHiddenElements.forEach(el => {
      if (el.contains(document.activeElement)) {
        console.log("🔄 Removing problematic aria-hidden");
        el.removeAttribute('aria-hidden');
      }
    });
    
    // Focus on app root
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.focus();
    } else {
      document.body.focus();
    }
    
    // Force re-enable pointer events on body and all children
    document.body.style.pointerEvents = 'auto';
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.style.pointerEvents === 'none') {
        el.style.pointerEvents = 'auto';
      }
    });
  };

  // Add a safety mechanism to restore interactions if stuck
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // If user clicks but nothing responds, restore interactions
      setTimeout(() => {
        if (document.querySelectorAll('[aria-hidden="true"]').length > 2) {
          console.log("🚨 Detected stuck UI state, restoring...");
          restoreFocusAndInteraction();
        }
      }, 100);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleDelete = async () => {
    console.log("🔄 Starting deletion process...");
    
    if (!user?.email) {
      console.log("❌ No user email");
      return;
    }

    if (!resume?.id) {
      console.log("❌ No resume ID");
      return;
    }

    console.log("🔄 Setting isDeleting to true");
    setIsDeleting(true);

    try {
      const db = getFirestore(app);
      const resumesRef = collection(db, "usersByEmail", user.email, "resumes");
      const resumeRef = doc(resumesRef, resume.id);

      console.log("🔄 Deleting from Firestore...");
      await deleteDoc(resumeRef);
      console.log("✅ Firestore deletion successful");
      
      console.log("🔄 Closing dialog...");
      setOpenAlert(false);
      
      console.log("🔄 Updating UI...");
      // Use onDelete callback to immediately remove from UI without refetching
      if (onDelete) {
        onDelete(resume.id);
      } else {
        // Fallback to refreshData if onDelete is not provided
        refreshData(true);
      }
      
      console.log("✅ Resume deleted successfully!");
      
      // Restore focus to prevent focus trapping
      setTimeout(() => {
        restoreFocusAndInteraction();
      }, 300);
      
    } catch (error) {
      console.error("❌ Error deleting resume:", error);
    }
    
    console.log("🔄 Setting isDeleting to false");
    setIsDeleting(false);
    console.log("✅ Deletion process complete");
  };

  const handleCloseDialog = () => {
    console.log("🔄 handleCloseDialog called, isDeleting:", isDeleting);
    if (!isDeleting) {
      console.log("🔄 Closing dialog...");
      setOpenAlert(false);
      // Ensure focus is restored when manually closing
      setTimeout(() => {
        restoreFocusAndInteraction();
      }, 100);
    } else {
      console.log("⚠️ Cannot close dialog - currently deleting");
    }
  };

  const handleCardClick = (e) => {
    if (isSelectionMode) {
      e.preventDefault();
      onSelect();
    }
  };

  const handleEditClick = () => {
    if (resume.templateId) {
      // Navigate to the template editing flow
      navigate(`/dashboard/resume/edit-template/${resume.resumeId}`);
    } else {
      // Navigate to the standard editing flow
      navigate(`/dashboard/${user.email}/${resume.resumeId}/edit`);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/my-resume/${user.email}/${resume.resumeId}/view`;
    const shareData = {
      title: `${resume.title} - Resume`,
      text: `Check out this professional resume: ${resume.title}`,
      url: shareUrl,
    };

    try {
      // Check if Web Share API is supported (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Resume shared successfully!");
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Resume link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing resume:", error);
      // Final fallback - try to copy to clipboard manually
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Resume link copied to clipboard!");
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        toast.error("Unable to share resume. Please try again.");
      }
    }
    
    // Close the dropdown
    setDropdownOpen(false);
  };

  return (
    <div className={`relative ${isSelectionMode ? 'cursor-pointer' : ''}`}>
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div 
          className="absolute top-2 left-2 z-10 bg-white rounded-full p-1 shadow-lg border border-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-600" />
          ) : (
            <Square className="h-5 w-5 text-gray-400" />
          )}
        </div>
      )}
      
      {/* Resume Card */}
      <div onClick={handleCardClick}>
        {isSelectionMode ? (
          <div
            className={`p-4 sm:p-8 md:p-12 lg:p-14 bg-gradient-to-bl from-slate-200 to-slate-50 h-[200px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-t-lg border-t-4 transition-all ${
              isSelected 
                ? 'ring-2 ring-blue-500 border-blue-500 bg-gradient-to-bl from-blue-50 to-blue-100' 
                : 'hover:shadow-md'
            }`}
            style={{
              borderColor: isSelected ? "rgb(59, 130, 246)" : "rgb(62,39,35)",
            }}
          >
            <div className="flex items-center justify-center h-full">
              <img
                src="https://cdn-icons-png.flaticon.com/512/5988/5988999.png"
                alt="Resume icon"
                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 transition-all ${
                  !isSelected ? 'hover:rotate-6 hover:scale-125' : ''
                }`}
              />
            </div>
          </div>
        ) : (
          <Link to={`/dashboard/${user.email}/${resume.resumeId}/view`}>
            <div
              className="p-4 sm:p-8 md:p-12 lg:p-14 bg-gradient-to-bl from-slate-200 to-slate-50 h-[200px] sm:h-[240px] md:h-[260px] lg:h-[280px] rounded-t-lg border-t-4"
              style={{
                borderColor: "rgb(62,39,35)",
              }}
            >
              <div className="flex items-center justify-center h-full">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/5988/5988999.png"
                  alt="Resume icon"
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 hover:rotate-6 hover:scale-125 transition-all"
                />
              </div>
            </div>
          </Link>
        )}
      </div>
      <div
        className={`border p-2 sm:p-3 flex justify-between text-white rounded-b-lg shadow-lg transition-all ${
          isSelectionMode && isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          background: isSelectionMode && isSelected ? "rgb(59, 130, 246)" : "rgb(62,39,35)",
        }}
      >
        <div className="flex items-center gap-2">
          {isSelectionMode && isSelected && (
            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          )}
          <h2 className="text-xs sm:text-sm truncate font-medium">{resume.title}</h2>
        </div>

        {!isSelectionMode && (
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded hover:bg-gray-700/20 transition-colors"
                aria-label="Resume actions"
              >
                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={handleEditClick}
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/dashboard/${user.email}/${resume.resumeId}/view`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/dashboard/${user.email}/${resume.resumeId}/view`)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                console.log("🔄 Delete menu item clicked, isDeleting:", isDeleting);
                if (!isDeleting) {
                  console.log("🔄 Opening delete dialog...");
                  setDropdownOpen(false); // Close dropdown first
                  setTimeout(() => {
                    setOpenAlert(true);
                  }, 100); // Small delay to ensure dropdown closes
                } else {
                  console.log("⚠️ Cannot open dialog - currently deleting");
                }
              }}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}

        <AlertDialog 
          open={openAlert} 
          onOpenChange={(open) => {
            console.log("🔄 AlertDialog onOpenChange:", open);
            if (!open && !isDeleting) {
              // Only allow closing if not currently deleting
              setOpenAlert(open);
              // Restore focus when dialog closes
              setTimeout(() => {
                restoreFocusAndInteraction();
              }, 100);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                resume and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={handleCloseDialog}
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2Icon className="animate-spin h-4 w-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ResumeItem;