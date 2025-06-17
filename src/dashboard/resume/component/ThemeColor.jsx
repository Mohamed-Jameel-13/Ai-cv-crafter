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
    const {resumeId}= useParams();
    
    const onColorSelect = async (color) => {
        setSelectedColor(color)
        setResumeInfo({
            ...resumeInfo,
            themeColor: color,
        })

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
    
    <Popover>
        <PopoverTrigger asChild>
        <Button className="flex gap-2" variant="outline" size="sm"><LayoutGrid/>Theme</Button>
        </PopoverTrigger>
        <PopoverContent>
            <h2 className="mb-2 text-sm font-bold">Select theme color</h2>
            <div className="grid grid-cols-5 gap-3">
            {colors.map((item,index)=>(
                <div key={index} onClick={()=>onColorSelect(item)}
                className={`h-5 w-5 rounded-full cursor-pointer border hover:border-black transition-all ${selectedColor==item&&'border-2 border-black scale-110'}`}
                style={{
                    background:item
                }}>
                    
                </div>
            ))}
            </div>
        </PopoverContent>
    </Popover>
  )
}

export default ThemeColor