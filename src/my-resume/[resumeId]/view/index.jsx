import Header from "@/components/custom/Header";
import { Button } from "@/components/ui/button";
import { ResumeContext } from "@/context/ResumeContext";
import ResumePreview from "@/dashboard/resume/component/ResumePreview";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RWebShare } from "react-web-share";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { LoaderCircle } from "lucide-react";

const ViewResume = () => {
  const [resumeInfo, setResumeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { email, resumeId } = useParams();

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const db = getFirestore(app);
        const resumeRef = doc(
          db,
          `usersByEmail/${email}/resumes`,
          `resume-${resumeId}`
        );

        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
          const data = resumeSnap.data();
          setResumeInfo(data)
        } else {
          console.error("No resume found!");
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
      } finally {
        setLoading(false);
      }
    };

    if (email && resumeId) {
      fetchResumeData();
    }
  }, [email, resumeId]);

  const handleDownload = () => {
    // Detect if we're on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    if (isMobile) {
      // For mobile devices, use direct print without popup
      handleMobilePrint();
    } else {
      // For desktop, use the popup approach
      handleDesktopPrint();
    }
  };

  const handleMobilePrint = () => {
    // Add mobile-specific print styles
    const printStyles = document.createElement('style');
    printStyles.id = 'mobile-print-styles';
    printStyles.innerHTML = `
      @media print {
        /* Hide everything except the resume */
        body * {
          visibility: hidden !important;
        }
        
        #print-area, #print-area * {
          visibility: visible !important;
        }
        
        /* Position the print area for printing */
        #print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 21cm !important;
          min-height: 29.7cm !important;
          margin: 0 !important;
          padding: 1cm !important;
          background: white !important;
          box-shadow: none !important;
          transform: none !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Hide the non-print elements */
        .no-print, #no-print {
          display: none !important;
        }
        
        /* Page setup */
        @page {
          size: A4 portrait;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        /* Force color preservation */
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `;
    
    document.head.appendChild(printStyles);
    
    // Trigger print dialog
    setTimeout(() => {
      window.print();
      
      // Clean up after print dialog closes
      setTimeout(() => {
        const styleElement = document.getElementById('mobile-print-styles');
        if (styleElement) {
          styleElement.remove();
        }
      }, 1000);
    }, 100);
  };

  const handleDesktopPrint = () => {
    const printContent = document.getElementById('print-area').innerHTML;
    const fullName = `${resumeInfo?.personalInfo?.firstName || 'Resume'}_${resumeInfo?.personalInfo?.lastName || 'Document'}`;
    
    // Try to open popup window
    const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // Check if popup was blocked
    if (!printWindow || printWindow.closed || typeof printWindow.closed == 'undefined') {
      // Fallback to mobile print method if popup is blocked
      alert('Popup blocked. Using alternative print method...');
      handleMobilePrint();
      return;
    }
    
    const cleanPrintDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fullName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        @page {
          size: A4 portrait;
          margin: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          background: white;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        .resume-container {
          width: 21cm;
          min-height: 29.7cm;
          margin: 0;
          padding: 1cm;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          color-adjust: exact;
        }
        
        [style*="border"], [style*="color"], hr {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        .text-xs { font-size: 10pt; line-height: 1.3; }
        .text-sm { font-size: 11pt; line-height: 1.4; }
        .text-base { font-size: 12pt; line-height: 1.4; }
        .text-lg { font-size: 13pt; line-height: 1.4; }
        .p-8 { padding: 16pt; }
        .my-1 { margin: 3pt 0; }
        .my-2 { margin: 6pt 0; }
        .mb-1 { margin-bottom: 3pt; }
        .mb-2 { margin-bottom: 6pt; }
        .space-y-2 > * + * { margin-top: 6pt; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        .text-gray-500 { color: #6B7280; }
        .text-gray-600 { color: #4B5563; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-baseline { align-items: baseline; }
        .break-words { word-wrap: break-word; }
        .leading-relaxed { line-height: 1.6; }
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .gap-1 { gap: 3pt; }
        .gap-2 { gap: 6pt; }
        .shadow-lg, .shadow-xl { box-shadow: none !important; }
        .border-t-\\[20px\\] { border-top-width: 20px !important; border-top-style: solid !important; }
        .min-w-fit { min-width: fit-content; }
        .mr-1 { margin-right: 3pt; }
        .list-disc { list-style-type: disc; }
        .list-inside { list-style-position: inside; }
        .pl-5 { padding-left: 15pt; }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${printContent}
      </div>
      
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }, 500);
        };
        
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>`;
    
    printWindow.document.write(cleanPrintDocument);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!resumeInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Resume not found</p>
      </div>
    );
  }

  const fullName = `${resumeInfo?.personalInfo?.firstName || ''} ${resumeInfo?.personalInfo?.lastName || ''}`;
  const shareUrl = `${window.location.origin}/my-resume/${email}/${resumeId}/view`;

  return (
    <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div id="no-print" className="no-print">
        <Header />
        <div className="my-5 mx-4 sm:mx-6 md:mx-10 lg:mx-20 xl:mx-36">
          <h2 className="text-center text-xl sm:text-2xl font-medium px-2">
            Congrats! Your Ultimate AI generated Resume is ready!
          </h2>
          <p className="text-center text-gray-400 text-sm sm:text-base px-4">
            Now you are ready to download your resume and you can share your
            unique resume to recruiters
          </p>
          <div className="w-auto m-auto flex flex-col sm:flex-row justify-center mt-3 items-center gap-2 sm:gap-4 px-4">
            <Button 
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90 rounded-full px-4 sm:px-6 py-2 w-full sm:w-auto text-sm sm:text-base"
            >
              Download PDF
            </Button>
            <RWebShare
              data={{
                text: `${fullName}'s Resume`,
                url: shareUrl,
                title: `${fullName} - Resume`,
              }}
            >
              <Button className="bg-secondary text-primary hover:bg-secondary/90 rounded-full px-4 sm:px-6 py-2 w-full sm:w-auto text-sm sm:text-base">
                Share Resume
              </Button>
            </RWebShare>
          </div>
        </div>
      </div>

      {/* Responsive container that maintains resume proportions */}
      <div className="my-4 sm:my-8 mx-auto px-2 sm:px-4 print:p-0 print:max-w-none print:mx-0">
        <div className="w-full max-w-4xl mx-auto">
          <div 
            id="print-area" 
            className="bg-white shadow-xl mx-auto print:shadow-none w-full max-w-full overflow-hidden resume-container"
            style={{ 
              minHeight: '29.7cm',
              boxSizing: 'border-box'
            }}
          >
            <ResumePreview />
          </div>
        </div>
      </div>

      {/* CSS for responsive design and print media */}
      <style>{`
        .resume-container {
          width: min(100%, 21cm);
          padding: clamp(0.5rem, 2vw, 2rem);
        }
        
        /* Mobile styles */
        @media (max-width: 640px) {
          .resume-container {
            aspect-ratio: 210/297;
            max-height: 90vh;
            overflow-y: auto;
            padding: 0.75rem;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 641px) and (max-width: 768px) {
          .resume-container {
            aspect-ratio: 210/297;
            max-height: 85vh;
            overflow-y: auto;
            padding: 1rem;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 769px) {
          .resume-container {
            width: min(21cm, 90vw);
            max-width: 21cm;
            padding: clamp(1rem, 2vw, 2rem);
          }
        }
        
        /* Print styles - Default fallback */
        @media print {
          /* Hide header and buttons during print */
          .no-print, #no-print {
            display: none !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .resume-container {
            width: 21cm !important;
            min-height: 29.7cm !important;
            padding: 1cm !important;
            aspect-ratio: unset !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
          
          /* Ensure colors and styles are preserved */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Page settings */
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </ResumeContext.Provider>
  );
};

export default ViewResume;