/* eslint-disable no-unused-vars */
import { Button } from "@/components/ui/button"
import{
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ResumeContext } from "@/context/ResumeContext"
import { UserContext } from "@/context/UserContext"
import { LayoutGrid } from "lucide-react"
import { useContext, useState } from "react"
import { useParams } from "react-router-dom"
import { getFirestore, doc, setDoc } from "firebase/firestore"
import { app } from "@/utils/firebase_config"
import { toast } from "sonner"
import { getCurrentUserEmail, isUserAuthenticated, handleFirebaseError, debugAuthState } from "@/utils/firebase_helpers"

const ThemeColor = () => {
    
    const colors=[
        "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
        "#33FFA1", "#888888", "#7133FF", "#FF335A", "#33A1FF", 
        "#ff0000", "#e300cc", "#33ffda", "#00399c", "#000000"
    ]

    const {resumeInfo,setResumeInfo} = useContext(ResumeContext)
    const userContext = useContext(UserContext)
    const [selectedColor, setSelectedColor] = useState(resumeInfo?.themeColor)
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const {resumeId}= useParams();
    
    const onColorSelect = async (color) => {
        setSelectedColor(color)
        setResumeInfo({
            ...resumeInfo,
            themeColor: color,
        })

        // Close popover immediately when color is selected
        setIsPopoverOpen(false)

        // Debug authentication state
        const authState = debugAuthState(userContext);
        
        // Check if user is authenticated
        if (!isUserAuthenticated(userContext)) {
            toast.error('Please sign in to save theme color');
            return;
        }

        const userEmail = getCurrentUserEmail(userContext);
        if (!userEmail) {
            toast.error('Unable to identify user email. Please sign in again.');
            return;
        }

        // Save to Firebase
        try {
            const db = getFirestore(app);
            const resumeRef = doc(db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
            
            console.log('🎨 Attempting to save theme color:', {
                color,
                userEmail,
                resumeId,
                path: `usersByEmail/${userEmail}/resumes/resume-${resumeId}`
            });
            
            await setDoc(resumeRef, {
                themeColor: color,
            }, { merge: true });
            
            console.log('✅ Theme color saved successfully');
            toast.success('Theme color updated successfully!');
            
        } catch (error) {
            console.error('❌ Theme color save failed:', error);
            handleFirebaseError(error, 'update theme color');
        }
    }

  return (
    
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
        <Button className="flex gap-2" variant="outline" size="sm"><LayoutGrid/>Theme</Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
            <h2 className="mb-3 text-sm font-bold">Select theme color</h2>
            <div className="grid grid-cols-5 gap-3">
            {colors.map((item,index)=>(
                <div 
                    key={index} 
                    onClick={()=>onColorSelect(item)}
                    className={`h-6 w-6 rounded-full cursor-pointer border hover:border-black transition-all duration-200 active:scale-95 ${selectedColor==item&&'border-2 border-black scale-110 shadow-lg'}`}
                    style={{
                        background:item
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onColorSelect(item);
                        }
                    }}
                    aria-label={`Select theme color ${item}`}
                >
                    
                </div>
            ))}
            </div>
        </PopoverContent>
    </Popover>
  )
}

export default ThemeColor