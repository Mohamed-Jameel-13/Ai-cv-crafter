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
    // Create a completely clean PDF with no browser elements
    const printContent = document.getElementById('print-area').innerHTML;
    const fullName = `${resumeInfo?.personalInfo?.firstName || 'Resume'}_${resumeInfo?.personalInfo?.lastName || 'Document'}`;
    
    // Create a new window with minimal browser chrome
    const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    const cleanPrintDocument = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fullName}</title>
      <style>
        /* Reset all margins and remove browser default styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Page setup for clean A4 PDF */
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
        
        /* Clean resume container */
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
        
        /* Force color preservation for all styled elements */
        [style*="border"], [style*="color"], hr {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        /* Typography optimization for PDF */
        .text-xs { font-size: 10pt; line-height: 1.3; }
        .text-sm { font-size: 11pt; line-height: 1.4; }
        .text-base { font-size: 12pt; line-height: 1.4; }
        .text-lg { font-size: 13pt; line-height: 1.4; }
        
        /* Spacing optimization */
        .p-8 { padding: 16pt; }
        .my-1 { margin: 3pt 0; }
        .my-2 { margin: 6pt 0; }
        .mb-1 { margin-bottom: 3pt; }
        .mb-2 { margin-bottom: 6pt; }
        .space-y-2 > * + * { margin-top: 6pt; }
        
        /* Font weights */
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        
        /* Text alignment */
        .text-center { text-align: center; }
        .text-justify { text-align: justify; }
        
        /* Colors */
        .text-gray-500 { color: #6B7280; }
        .text-gray-600 { color: #4B5563; }
        
        /* Layout utilities */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-baseline { align-items: baseline; }
        .break-words { word-wrap: break-word; }
        .leading-relaxed { line-height: 1.6; }
        
        /* Grid utilities */
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .gap-1 { gap: 3pt; }
        .gap-2 { gap: 6pt; }
        
        /* Hide shadows and borders in print */
        .shadow-lg, .shadow-xl { box-shadow: none !important; }
        .border-t-\\[20px\\] { border-top-width: 20px !important; border-top-style: solid !important; }
        
        /* Responsive utilities for print */
        .min-w-fit { min-width: fit-content; }
        .mr-1 { margin-right: 3pt; }
        
        /* List styles */
        .list-disc { list-style-type: disc; }
        .list-inside { list-style-position: inside; }
        .pl-5 { padding-left: 15pt; }
        
        /* Remove any potential browser styling */
        @media print {
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${printContent}
      </div>
      
      <script>
        // Auto-print when page loads and close after printing
        window.onload = function() {
          // Small delay to ensure content is fully rendered
          setTimeout(function() {
            // Focus the window to ensure print dialog appears
            window.focus();
            // Trigger print
            window.print();
            // Close window after print dialog (user may cancel, so we don't force close immediately)
            setTimeout(function() {
              window.close();
            }, 1000);
          }, 500);
        };
        
        // Handle print completion
        window.onafterprint = function() {
          window.close();
        };
      </script>
    </body>
    </html>`;
    
    // Write the clean document to the new window
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
        <div className="my-5 mx-10 md:mx-20 lg:mx-36">
          <h2 className="text-center text-2xl font-medium">
            Congrats! Your Ultimate AI generated Resume is ready!
          </h2>
          <p className="text-center text-gray-400">
            Now you are ready to download your resume and you can share your
            unique resume to recruiters
          </p>
          <div className="w-auto m-auto flex justify-center mt-3 items-center gap-4">
            <Button 
              onClick={handleDownload}
              className="bg-primary hover:bg-primary/90 rounded-full px-6 py-2"
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
              <Button className="bg-secondary text-primary hover:bg-secondary/90 rounded-full px-6 py-2">
                Share Resume
              </Button>
            </RWebShare>
          </div>
        </div>
      </div>

      {/* A4 sized container for better preview and print formatting */}
      <div className="my-8 mx-auto max-w-4xl px-4 print:p-0 print:max-w-none print:mx-0">
        <div 
          id="print-area" 
          className="bg-white shadow-xl mx-auto print:shadow-none"
          style={{ 
            width: '21cm', 
            minHeight: '29.7cm',
            padding: '1cm',
            boxSizing: 'border-box'
          }}
        >
          <ResumePreview />
        </div>
      </div>
    </ResumeContext.Provider>
  );
};

export default ViewResume;