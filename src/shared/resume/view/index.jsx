import { Button } from "@/components/ui/button";
import { ResumeContext } from "@/context/ResumeContext";
import ResumePreview from "@/dashboard/resume/component/ResumePreview";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { RWebShare } from "react-web-share";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/utils/firebase_config";
import { LoaderCircle, Download, Share2, Eye, ArrowLeft } from "lucide-react";

const SharedResumeView = () => {
  const [resumeInfo, setResumeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { email, resumeId } = useParams();

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const db = getFirestore(app);
        const resumeRef = doc(
          db,
          `usersByEmail/${email}/resumes`,
          `resume-${resumeId}`
        );

        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
          const data = resumeSnap.data();
          console.log('📄 Shared Resume data loaded:', { 
            templateName: data.templateName, 
            aiTemplateName: data.aiTemplateName,
            hasPdfBase64: !!data.pdfBase64,
            title: data.title
          });
          setResumeInfo(data);
        } else {
          console.error("No resume found!");
          setError("Resume not found or not available for sharing.");
        }
      } catch (error) {
        console.error("Error fetching shared resume:", error);
        setError("Unable to load resume. Please check the link and try again.");
      } finally {
        setLoading(false);
      }
    };

    if (email && resumeId) {
      fetchResumeData();
    } else {
      setError("Invalid resume link.");
      setLoading(false);
    }
  }, [email, resumeId]);

  const handleDownload = () => {
    // If this is a template-generated resume with PDF, download the PDF directly
    if (resumeInfo?.pdfBase64) {
      downloadPdfFromBase64(resumeInfo.pdfBase64, `${resumeInfo.title || 'Resume'}.pdf`);
      return;
    }

    // For default resumes, use the print-to-PDF approach
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    if (isMobile) {
      handleMobilePrint();
    } else {
      handleDesktopPrint();
    }
  };

  const downloadPdfFromBase64 = (base64Data, filename) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
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
      </style>
    </head>
    <body>
      <div class="resume-container">
        ${printContent}
      </div>
    </body>
    </html>`;
    
    printWindow.document.write(cleanPrintDocument);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading shared resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h1>
            <p className="text-gray-600">{error}</p>
          </div>
          <Link to="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!resumeInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Available</h1>
            <p className="text-gray-600">This resume is not available for public viewing.</p>
          </div>
          <Link to="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${resumeInfo?.personalInfo?.firstName || ''} ${resumeInfo?.personalInfo?.lastName || ''}`.trim() || 'Professional Resume';
  const shareUrl = window.location.href;

  return (
    <ResumeContext.Provider value={{ resumeInfo, setResumeInfo }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header Section - No Print */}
        <div id="no-print" className="no-print bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Resume Title */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                  {fullName}
                </h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1">
                  {resumeInfo.title || 'Professional Resume'}
                </p>
                {resumeInfo.templateName || resumeInfo.aiTemplateName ? (
                  <p className="text-xs sm:text-sm text-blue-600 mt-1">
                    Created with {resumeInfo.templateName || resumeInfo.aiTemplateName} template
                  </p>
                ) : null}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base w-full xs:w-auto"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="hidden xs:inline">Download PDF</span>
                  <span className="xs:hidden">Download</span>
                </Button>
                
                <RWebShare
                  data={{
                    text: `Check out ${fullName}'s Resume`,
                    url: shareUrl,
                    title: `${fullName} - Resume`,
                  }}
                >
                  <Button 
                    variant="outline" 
                    className="border-blue-600 hover:border-[rgb(63,39,34)] text-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-2 text-sm sm:text-base w-full xs:w-auto"
                    size="sm"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Share Resume</span>
                    <span className="xs:hidden">Share</span>
                  </Button>
                </RWebShare>
                
                <Link to="/">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 sm:px-4 py-2 text-sm w-full xs:w-auto"
                    size="sm"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">AI Resume Crafter</span>
                    <span className="sm:hidden">Home</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div className="py-2 sm:py-6 lg:py-8 px-1 sm:px-4 print:p-0 print:max-w-none print:mx-0">
          <div className="max-w-5xl mx-auto">
            <div 
              id="print-area" 
              className="bg-white shadow-xl mx-auto print:shadow-none w-full max-w-full overflow-hidden resume-container"
              style={{ 
                minHeight: '29.7cm',
                boxSizing: 'border-box'
              }}
            >
              {resumeInfo?.pdfBase64 ? (
                // Display the actual generated PDF for template resumes
                <div className="w-full h-full">
                  <div className="pdf-viewer-container">
                    {/* Desktop PDF embed - original style */}
                    <embed
                      src={`data:application/pdf;base64,${resumeInfo.pdfBase64}`}
                      type="application/pdf"
                      width="100%"
                      height="800px"
                      className="border-0 rounded-lg hidden lg:block"
                      style={{ minHeight: '29.7cm' }}
                    />
                    
                    {/* Mobile/Tablet iframe - improved style */}
                    <iframe
                      src={`data:application/pdf;base64,${resumeInfo.pdfBase64}`}
                      width="100%"
                      height="600px"
                      className="border-0 rounded-lg block lg:hidden"
                      style={{ 
                        minHeight: 'min(80vh, 600px)',
                        height: 'min(80vh, 600px)'
                      }}
                      title="Resume PDF"
                    />
                  </div>
                </div>
              ) : (
                // Fall back to ResumePreview for default resumes
                <div className="p-4 sm:p-6 lg:p-8">
                  <ResumePreview />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - No Print */}
        <div id="no-print-footer" className="no-print bg-white border-t py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              This resume was created with AI Resume Crafter
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Create your own professional resume
              <ArrowLeft className="ml-1 h-4 w-4 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive CSS Styles */}
      <style>{`
        /* Base responsive container */
        .resume-container {
          width: min(100%, 21cm);
          padding: clamp(0.5rem, 2vw, 2rem);
        }
        
        /* PDF viewer styles */
        .pdf-viewer-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        /* PDF embed and iframe styling */
        embed[type="application/pdf"], .pdf-iframe-fallback {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Hide iframe fallback by default */
        .pdf-iframe-fallback {
          display: none;
        }
        
        /* Base responsive container */
        .resume-container {
          width: min(100%, 21cm);
          padding: clamp(0.5rem, 2vw, 2rem);
        }
        
        /* PDF viewer styles */
        .pdf-viewer-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        /* Mobile styles - improved iframe viewing */
        @media (max-width: 640px) {
          .resume-container {
            height: 85vh;
            max-height: 85vh;
            overflow: hidden;
            padding: 0.25rem;
            margin: 0;
          }
          
          .pdf-viewer-container {
            height: 100%;
            margin: 0;
            padding: 0;
          }
          
          .pdf-viewer-container iframe {
            height: 100% !important;
            min-height: unset !important;
          }
        }
        
        /* Tablet styles */
        @media (min-width: 641px) and (max-width: 1023px) {
          .resume-container {
            aspect-ratio: 210/297;
            max-height: 85vh;
            overflow-y: auto;
            padding: 0.75rem;
          }
        }
        
        /* Desktop styles - original layout */
        @media (min-width: 1024px) {
          .resume-container {
            width: min(21cm, 85vw);
            max-width: 21cm;
            padding: clamp(1rem, 2vw, 2rem);
          }
        }
        
        /* Print styles */
        @media print {
          /* Hide all non-print elements */
          .no-print, #no-print, #no-print-footer {
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
        
        /* Custom breakpoint for very small screens (Mini iPhone, etc.) */
        @media (max-width: 375px) {
          .resume-container {
            height: 80vh;
            max-height: 80vh;
            padding: 0.15rem;
            overflow: hidden;
          }
        }
      `}</style>
    </ResumeContext.Provider>
  );
};

export default SharedResumeView; 