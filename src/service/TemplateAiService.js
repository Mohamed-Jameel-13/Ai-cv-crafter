import { sendMessageToAI } from "../../service/AiModel.js";
import Logger from "../utils/logger.js";

class TemplateAiService {
  static async generateTemplateResume(templateName, resumeData, options = {}) {
    try {
      Logger.log("🚀 Starting template resume generation:", {
        templateName,
        resumeData,
      });

      // Step 1: Generate AI prompt with template name and resume data
      const aiPrompt = this.generatePrompt(templateName, resumeData);
      Logger.log("📝 Generated AI prompt for template:", templateName);
      Logger.log("📝 Full AI prompt:", aiPrompt);

      // Step 2: Get LaTeX code from AI
      Logger.log("🤖 Calling AI with prompt...");
      const latexResponse = await sendMessageToAI(aiPrompt);
      Logger.log("🤖 Raw AI response:", latexResponse);

      const latexContent = latexResponse?.response?.text?.() || latexResponse;
      Logger.log("🤖 Extracted LaTeX content:", typeof latexContent);
      Logger.log(
        "🤖 LaTeX content preview:",
        latexContent?.substring(0, 500) + "...",
      );

      if (!latexContent || typeof latexContent !== "string") {
        Logger.error("❌ Invalid AI response:", {
          latexResponse,
          latexContent,
        });
        throw new Error("AI did not return valid LaTeX content");
      }

      // Check if the response contains actual LaTeX
      if (
        !latexContent.includes("\\documentclass") &&
        !latexContent.includes("\\begin{document}")
      ) {
        Logger.warn("⚠️ AI response does not contain valid LaTeX structure");
        throw new Error("AI response does not contain valid LaTeX document");
      }

      // Step 3: Clean and validate LaTeX code
      let cleanedLatex = this.cleanLatexCode(latexContent);
      Logger.log("🧹 Cleaned LaTeX code length:", cleanedLatex.length);
      Logger.log(
        "🧹 First 500 chars of cleaned LaTeX:",
        cleanedLatex.substring(0, 500),
      );

      // Step 3.5: Validate LaTeX structure
      const validationResult = this.validateLatexStructure(cleanedLatex);
      if (!validationResult.isValid) {
        Logger.warn(
          "⚠️ LaTeX structure validation failed:",
          validationResult.errors,
        );
        throw new Error(
          `LaTeX structure validation failed: ${validationResult.errors.join(", ")}`,
        );
      }

      // Step 3.6: Fix template-specific formatting issues
      if (templateName === "Jake") {
        cleanedLatex = this.ensureJakeTemplateFormatting(cleanedLatex);
      }

      // Step 4: Compile PDF using YtoTech API with retry mechanism
      let pdfResult;
      let finalLatexCode = cleanedLatex;

      // Try AI-generated LaTeX with retries
      const maxRetries = 3;
      let attempt = 1;
      let lastError = null;

      while (attempt <= maxRetries) {
        try {
          console.log(`📄 Compilation attempt ${attempt}/${maxRetries}`);
          pdfResult = await this.compileLatexToPdf(
            finalLatexCode,
            templateName,
          );
          console.log("✅ Successfully compiled PDF on attempt", attempt);
          break;
        } catch (compilationError) {
          lastError = compilationError;
          console.warn(
            `⚠️ Compilation attempt ${attempt} failed:`,
            compilationError.message,
          );

          if (attempt < maxRetries) {
            // Analyze the error and generate improved LaTeX
            console.log(
              "🔄 Analyzing error and retrying with improved prompt...",
            );
            const errorAnalysis = this.analyzeLatexError(
              compilationError.message,
            );
            const improvedPrompt = this.generateImprovedPrompt(
              templateName,
              resumeData,
              errorAnalysis,
              attempt,
            );

            // Get new LaTeX from AI
            const retryResponse =
              await sendMessageToAI(improvedPrompt);
            const retryLatexContent =
              retryResponse?.response?.text?.() || retryResponse;

            // Clean and validate the retry response
            const cleanedRetryLatex = this.cleanLatexCode(retryLatexContent);
            const retryValidationResult =
              this.validateLatexStructure(cleanedRetryLatex);

            if (retryValidationResult.isValid) {
              finalLatexCode = cleanedRetryLatex;
              console.log(
                `🔄 Retry ${attempt} - New LaTeX generated and validated`,
              );
            } else {
              console.warn(
                `⚠️ Retry ${attempt} - Validation failed, using previous version`,
              );
            }

            attempt++;
          } else {
            // Max retries reached, use fallback
            console.warn("⚠️ Max retries reached, using fallback template...");
            const fallbackLatex = this.generateFallbackLatex(
              resumeData,
              templateName,
            );
            finalLatexCode = fallbackLatex;
            pdfResult = await this.compileLatexToPdf(
              fallbackLatex,
              templateName,
            );
            console.log("📄 Fallback compilation successful");
            break;
          }
        }
      }

      return {
        success: true,
        latexCode: finalLatexCode, // Return the actually used LaTeX code
        pdfBase64: pdfResult.pdfBase64,
        pdfUrl: pdfResult.pdfUrl,
        templateName,
        metadata: {
          generatedAt: new Date().toISOString(),
          templateUsed: templateName,
          compilerUsed: pdfResult.compiler,
        },
      };
    } catch (error) {
      console.error("❌ Template resume generation failed:", error);
      console.error("❌ Error details:", error.stack);
      throw new Error(`Resume generation failed: ${error.message}`);
    }
  }

  static generatePrompt(templateName, resumeData) {
    // Extract data from resumeData structure
    const personal = resumeData.personalDetail || {};
    const summary = resumeData.summary || "";
    const work = resumeData.work || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const education = resumeData.education || [];

    // Helper function to clean HTML content
    const cleanHtml = (text) => {
      if (!text) return "";
      return text
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
        .replace(/&amp;/g, "&") // Replace HTML entities
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };

    // Helper function to format dates to "May 2024" format
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return dateString; // Return original if formatting fails
      }
    };

    // Create formatted data for AI prompt
    const fullName =
      `${personal.firstName || ""} ${personal.lastName || ""}`.trim();
    const jobTitle = personal.jobTitle || "";
    const contact = {
      email: personal.email || "",
      phone: personal.phone || "",
      address: personal.address || "",
      linkedin: personal.linkedin || "",
      github: personal.github || "",
      portfolio: personal.portfolio || "",
    };

    // Format work experience - clean HTML content
    const workExperience = work.map((job) => ({
      title: job.title || "",
      company: job.companyName || "",
      startDate: job.startDate || "",
      endDate: job.currentlyWorking ? "Present" : job.endDate || "",
      description: cleanHtml(job.workSummery || ""), // Clean HTML content
    }));

    // Format education
    const educationHistory = education.map((edu) => ({
      degree: edu.degree || "",
      school: edu.school || "", // Fixed: using school instead of universityName
      fieldOfStudy: edu.fieldOfStudy || "",
      graduationDate: edu.graduationDate || "",
      // Handle both old cgpa field and new grade structure
      cgpa: edu.gradeValue || edu.cgpa || "",
      gradeType: edu.gradeType || (edu.cgpa ? "cgpa" : ""),
      description: cleanHtml(edu.description || ""), // Clean HTML content from education description
    }));

    // Format skills
    const skillsList = Array.isArray(skills)
      ? skills
          .map((skill) => {
            if (typeof skill === "object" && skill.skills) {
              return `${skill.category}: ${skill.skills}`;
            }
            return skill.name || skill;
          })
          .filter(Boolean)
      : [];

    // Format projects
    const projectsList = projects.map((project) => ({
      title: project.title || project.name || "",
      description: cleanHtml(project.description || ""),
      technologies: project.techStack || project.technologies || "",
      startDate: formatDate(project.startDate) || "",
      endDate: formatDate(project.endDate) || "",
      liveDemo: project.liveDemo || "",
      githubRepo: project.githubRepo || "",
      url: project.projectUrl || "",
      bullets: project.bullets || [], // Include bullets for all templates
    }));

    // Format certifications
    const certificationsList = (resumeData.certifications || []).map(
      (cert) => ({
        name: cert.name || "",
        issuer: cert.issuer || "",
        date: formatDate(cert.date) || "",
        expirationDate: formatDate(cert.expirationDate) || "",
        link: cert.link || "",
        description: cleanHtml(cert.description || ""),
      }),
    );

    // For Jake template, provide exact format
    if (templateName === "Jake") {
      return this.generateJakeSpecificPrompt(resumeData);
    }

    // Enhanced prompt for other templates
    const prompt = `Generate a professional resume using the "${templateName}" template style.

TEMPLATE: ${templateName}

RESUME DATA:
Personal Information:
- Name: ${fullName}
- Job Title: ${jobTitle}
- Email: ${contact.email}
- Phone: ${contact.phone}
- Address: ${contact.address}
- LinkedIn: ${contact.linkedin}
- GitHub: ${contact.github}
- Portfolio: ${contact.portfolio}

Professional Summary:
${summary}

Work Experience:
${workExperience
  .map(
    (job, index) => `
${index + 1}. ${job.title} at ${job.company}
   Duration: ${job.startDate} - ${job.endDate}
   Description: ${job.description}
`,
  )
  .join("")}

Education:
${educationHistory
  .map(
    (edu, index) => `
${index + 1}. ${edu.degree}
   Institution: ${edu.school}
   Field of Study: ${edu.fieldOfStudy}
   Graduation Date: ${edu.graduationDate}
   ${edu.gradeType === "percentage" ? "Percentage" : "CGPA"}: ${edu.cgpa || "Not specified"}
   Description: ${edu.description}
`,
  )
  .join("")}

Skills:
${skillsList.join(", ")}

Projects:
${projectsList
  .map(
    (project, index) => `
${index + 1}. ${project.title}
   Description: ${project.description}
   Highlights/Bullets: ${project.bullets && project.bullets.length > 0 ? project.bullets.filter((b) => b && b.trim()).join(" | ") : "None"}
   Technologies: ${project.technologies}
   Live Demo: ${project.liveDemo}
   GitHub Repo: ${project.githubRepo}
   URL: ${project.url}
`,
  )
  .join("")}

Certifications:
${certificationsList
  .map(
    (cert, index) => `
${index + 1}. ${cert.name}
   Issuer: ${cert.issuer}
   Date Obtained: ${cert.date}
   Expiration Date: ${cert.expirationDate || "No expiration"}
   Link: ${cert.link || "Not provided"}
   Description: ${cert.description}
`,
  )
  .join("")}

CRITICAL LaTeX REQUIREMENTS:
1. Start with \\documentclass[11pt]{article} or similar
2. Include necessary packages (geometry, hyperref, etc.)
3. MUST have \\begin{document} after preamble
4. MUST end with \\end{document}
5. Every \\begin{environment} MUST have matching \\end{environment}
6. Ensure all braces { } are properly closed
7. Escape special characters: & % $ # _ { } ^ ~
8. Use proper LaTeX syntax throughout

Generate a complete, syntactically correct LaTeX document for this resume using the ${templateName} template format. Return ONLY the LaTeX code from \\documentclass to \\end{document} with no additional text or explanations.`;

    return prompt;
  }

  static async compileLatexToPdf(latexCode, templateName) {
    try {
      console.log("🔨 Starting PDF compilation with YtoTech API...");
      console.log(
        "📄 LaTeX code to compile (first 1000 chars):",
        latexCode.substring(0, 1000),
      );

      // Prepare the request payload for YtoTech LaTeX-on-HTTP API
      const payload = {
        resources: [
          {
            main: true,
            content: latexCode,
          },
        ],
        compiler: "pdflatex", // Use pdflatex for better compatibility
        timeout: 30, // 30 second timeout
      };

      console.log("🌐 Making request to YtoTech API...");

      // Make request to YtoTech API
      const response = await fetch("https://latex.ytotech.com/builds/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body: JSON.stringify(payload),
      });

      console.log(
        "📡 YtoTech API response status:",
        response.status,
        response.statusText,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ YtoTech API error response:", errorText);

        // Try to parse the error response
        let parsedError;
        try {
          parsedError = JSON.parse(errorText);
          console.error("❌ Parsed error details:", parsedError);
        } catch (e) {
          console.error("❌ Could not parse error response as JSON");
        }

        throw new Error(
          `LaTeX compilation failed. Check your input data for special characters or formatting issues. API Response: ${errorText}`,
        );
      }

      // Get PDF as array buffer
      const pdfArrayBuffer = await response.arrayBuffer();
      console.log("✅ Received PDF, size:", pdfArrayBuffer.byteLength, "bytes");

      // Convert to base64 for storage/transfer
      const pdfBase64 = this.arrayBufferToBase64(pdfArrayBuffer);

      // Create blob URL for immediate viewing
      const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      console.log("✅ PDF compilation successful");

      return {
        pdfBase64,
        pdfUrl,
        compiler: payload.compiler,
        size: pdfArrayBuffer.byteLength,
      };
    } catch (error) {
      console.error("❌ PDF compilation failed:", error);
      console.error("❌ PDF compilation error stack:", error.stack);

      // Provide helpful error messages for common issues
      if (error.message.includes("timeout")) {
        throw new Error(
          "PDF compilation timed out. The template might be too complex.",
        );
      }

      if (error.message.includes("LaTeX Error")) {
        throw new Error(
          "LaTeX compilation error. Please check your resume data for special characters.",
        );
      }

      // Pass through the original error message which now includes more details
      throw new Error(error.message);
    }
  }

  static cleanLatexCode(rawLatex) {
    try {
      console.log("🧹 Cleaning LaTeX code...");

      let cleaned = rawLatex;

      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```latex\n?/g, "");
      cleaned = cleaned.replace(/```\n?/g, "");
      cleaned = cleaned.replace(/```tex\n?/g, "");

      // Remove any leading/trailing explanatory text
      cleaned = cleaned.trim();

      // Remove any non-LaTeX content at the beginning
      const docClassMatch = cleaned.match(/\\documentclass/);
      if (docClassMatch) {
        cleaned = cleaned.substring(docClassMatch.index);
      }

      // Remove any trailing explanatory text after \end{document}
      const endDocMatch = cleaned.match(/\\end\{document\}/);
      if (endDocMatch) {
        cleaned = cleaned.substring(
          0,
          endDocMatch.index + endDocMatch[0].length,
        );
      }

      // Ensure proper document structure
      if (!cleaned.includes("\\documentclass")) {
        console.warn("⚠️ No documentclass found, this might be a fragment");
      }

      // Validate that we have both begin and end document
      if (
        !cleaned.includes("\\begin{document}") ||
        !cleaned.includes("\\end{document}")
      ) {
        console.warn("⚠️ Incomplete document structure detected");
      }

      // Fix common LaTeX issues but preserve intended formatting
      cleaned = this.fixCommonLatexIssues(cleaned);

      // Attempt to repair common structural issues
      cleaned = this.repairLatexStructure(cleaned);

      console.log("✅ LaTeX code cleaned successfully");
      return cleaned;
    } catch (error) {
      console.error("❌ LaTeX cleaning failed:", error);
      throw new Error(`LaTeX code cleaning failed: ${error.message}`);
    }
  }

  static repairLatexStructure(latex) {
    let repaired = latex;

    try {
      console.log("🔧 Attempting to repair LaTeX structure...");

      // Ensure we have \end{document} if we have \begin{document}
      if (
        repaired.includes("\\begin{document}") &&
        !repaired.includes("\\end{document}")
      ) {
        console.log("🔧 Adding missing \\end{document}");
        repaired += "\n\\end{document}";
      }

      // Fix common environment mismatches
      const environments = [
        "center",
        "itemize",
        "enumerate",
        "tabular",
        "tabular*",
      ];

      for (const env of environments) {
        const beginRegex = new RegExp(`\\\\begin\\{${env}\\}`, "g");
        const endRegex = new RegExp(`\\\\end\\{${env}\\}`, "g");

        const beginMatches = repaired.match(beginRegex) || [];
        const endMatches = repaired.match(endRegex) || [];

        if (beginMatches.length > endMatches.length) {
          const missing = beginMatches.length - endMatches.length;
          console.log(`🔧 Adding ${missing} missing \\end{${env}}`);
          for (let i = 0; i < missing; i++) {
            // Add missing \end{} before the document end
            const endDocIndex = repaired.lastIndexOf("\\end{document}");
            if (endDocIndex !== -1) {
              repaired =
                repaired.substring(0, endDocIndex) +
                `\\end{${env}}\n\n` +
                repaired.substring(endDocIndex);
            } else {
              repaired += `\n\\end{${env}}`;
            }
          }
        }
      }

      // Fix unclosed braces (basic repair)
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;

      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces;
        console.log(`🔧 Adding ${missing} missing closing braces`);
        // Add missing closing braces before document end
        const endDocIndex = repaired.lastIndexOf("\\end{document}");
        if (endDocIndex !== -1) {
          repaired =
            repaired.substring(0, endDocIndex) +
            "}".repeat(missing) +
            "\n\n" +
            repaired.substring(endDocIndex);
        } else {
          repaired += "}".repeat(missing);
        }
      }

      // Ensure proper line breaks around document boundaries
      repaired = repaired.replace(/(\\documentclass[^\n]*)/g, "$1\n");
      repaired = repaired.replace(/(\\begin\{document\})/g, "\n$1\n");
      repaired = repaired.replace(/(\\end\{document\})/g, "\n$1\n");

      console.log("✅ LaTeX structure repair completed");
      return repaired;
    } catch (error) {
      console.error("❌ LaTeX repair failed:", error);
      return latex; // Return original if repair fails
    }
  }

  static fixCommonLatexIssues(latex) {
    let fixed = latex;

    // Fix common character encoding issues
    fixed = fixed.replace(/"/g, "''"); // Replace smart quotes
    fixed = fixed.replace(/"/g, "``"); // Replace smart quotes
    fixed = fixed.replace(/'/g, "'"); // Replace smart apostrophes
    fixed = fixed.replace(/'/g, "`"); // Replace smart apostrophes
    fixed = fixed.replace(/—/g, "---"); // Replace em dash
    fixed = fixed.replace(/–/g, "--"); // Replace en dash

    // DON'T escape characters that are part of LaTeX commands
    // Only escape characters that appear in document content, not in LaTeX commands

    // Split document into preamble and content
    const beginDocMatch = fixed.match(/\\begin\{document\}/);
    if (beginDocMatch) {
      const preamble = fixed.substring(
        0,
        beginDocMatch.index + beginDocMatch[0].length,
      );
      const content = fixed.substring(
        beginDocMatch.index + beginDocMatch[0].length,
      );

      // Only escape characters in document content, not in preamble
      let fixedContent = content;
      fixedContent = fixedContent.replace(/([^\\])&/g, "$1\\&"); // Escape unescaped ampersands
      fixedContent = fixedContent.replace(/([^\\])%/g, "$1\\%"); // Escape unescaped percent signs
      fixedContent = fixedContent.replace(/([^\\])\$/g, "$1\\$"); // Escape unescaped dollar signs
      // Don't escape # in content either as it might be part of commands

      fixed = preamble + fixedContent;
    }

    // Fix spacing issues
    fixed = fixed.replace(/\s+/g, " "); // Normalize whitespace
    fixed = fixed.replace(/\n\s*\n\s*\n/g, "\n\n"); // Fix excessive line breaks

    return fixed;
  }

  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  static base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static downloadPdf(pdfBase64, filename = "resume.pdf") {
    try {
      const arrayBuffer = this.base64ToArrayBuffer(pdfBase64);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);

      console.log("✅ PDF download initiated");
    } catch (error) {
      console.error("❌ PDF download failed:", error);
      throw new Error(`PDF download failed: ${error.message}`);
    }
  }

  static previewPdf(pdfBase64) {
    try {
      const arrayBuffer = this.base64ToArrayBuffer(pdfBase64);
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open in new tab
      window.open(url, "_blank");

      // Clean up the object URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      console.log("✅ PDF preview opened");
    } catch (error) {
      console.error("❌ PDF preview failed:", error);
      throw new Error(`PDF preview failed: ${error.message}`);
    }
  }

  static generateFallbackLatex(resumeData, templateName = "Standard") {
    // Generate template-specific fallback LaTeX document when primary generation fails
    const personal = resumeData.personalDetail || {};
    const fullName =
      `${personal.firstName || ""} ${personal.lastName || ""}`.trim();

    // Generate different fallbacks based on template
    if (templateName === "Jake") {
      return this.generateJakeFallbackLatex(resumeData);
    }

    // Default fallback for other templates

    const escapeLatex = (text) => {
      if (!text) return "";

      // Ensure text is a string and clean HTML first
      let str = typeof text === "string" ? text : String(text);

      // Clean HTML content
      str = str
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
        .replace(/&amp;/g, "&") // Replace HTML entities
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      // Escape LaTeX special characters
      return str
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/[&%$#_{}]/g, "\\$&")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
    };

    return `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large\\bfseries ${escapeLatex(fullName)}}\\\\[4pt]
${escapeLatex(personal.email || "")} | ${escapeLatex(personal.phone || "")}\\\\
${escapeLatex(personal.address || "")}
\\end{center}

\\vspace{12pt}

\\section*{Professional Summary}
${escapeLatex(resumeData.summary || "Dedicated professional seeking new opportunities.")}

\\section*{Experience}
${(resumeData.work || [])
  .map(
    (job) => `
\\textbf{${escapeLatex(job.title || "")}} - ${escapeLatex(job.companyName || "")}\\\\
${escapeLatex(job.startDate || "")} - ${escapeLatex(job.currentlyWorking ? "Present" : job.endDate || "")}\\\\
${escapeLatex(job.workSummery || job.workSummary || "")}\\\\[6pt]
`,
  )
  .join("")}

\\section*{Skills}
${(resumeData.skills || [])
  .map((skill) => {
    if (typeof skill === "object" && skill.skills) {
      return `\\textbf{${escapeLatex(skill.category || "Skills")}:} ${escapeLatex(skill.skills)}`;
    }
    return escapeLatex(skill.name || skill);
  })
  .filter(Boolean)
  .join("\\\\[3pt]")}

\\section*{Projects}
${(resumeData.projects || [])
  .map(
    (project) => `
\\textbf{${escapeLatex(project.title || project.name || "")}}\\\\
${escapeLatex(project.technologies || project.techStack || "")}\\\\
${escapeLatex(project.description || "")}\\\\[6pt]
`,
  )
  .join("")}

\\section*{Certifications}
${(resumeData.certifications || [])
  .map(
    (cert) => `
\\textbf{${escapeLatex(cert.name || "")}}\\\\
${escapeLatex(cert.issuer || "")}\\\\
${escapeLatex(cert.date || "")}${cert.expirationDate ? ` - Expires: ${escapeLatex(cert.expirationDate)}` : ""}\\\\
${escapeLatex(cert.description || "")}\\\\[6pt]
`,
  )
  .join("")}

\\section*{Education}
${(resumeData.education || [])
  .map(
    (edu) => `
\\textbf{${escapeLatex(edu.degree || "")}}\\\\
${escapeLatex(edu.school || "")}\\\\
${escapeLatex(edu.fieldOfStudy || "")} | ${escapeLatex(edu.graduationDate || "")}${edu.cgpa ? ` | CGPA: ${escapeLatex(edu.cgpa)}` : ""}\\\\[6pt]
`,
  )
  .join("")}

\\end{document}`;
  }

  static validateLatexStructure(latexCode) {
    const errors = [];
    let isValid = true;

    try {
      // Check for required document structure
      if (!latexCode.includes("\\documentclass")) {
        errors.push("Missing \\documentclass declaration");
        isValid = false;
      }

      if (!latexCode.includes("\\begin{document}")) {
        errors.push("Missing \\begin{document}");
        isValid = false;
      }

      if (!latexCode.includes("\\end{document}")) {
        errors.push("Missing \\end{document}");
        isValid = false;
      }

      // Check for matching begin/end pairs
      const beginEndPairs = [
        "document",
        "center",
        "itemize",
        "enumerate",
        "tabular",
        "tabular*",
        "minipage",
        "figure",
        "table",
        "equation",
        "align",
        "flushleft",
        "flushright",
        "quote",
        "quotation",
        "verse",
      ];

      for (const env of beginEndPairs) {
        const beginCount = (
          latexCode.match(new RegExp(`\\\\begin\\{${env}\\}`, "g")) || []
        ).length;
        const endCount = (
          latexCode.match(new RegExp(`\\\\end\\{${env}\\}`, "g")) || []
        ).length;

        if (beginCount !== endCount) {
          errors.push(
            `Mismatched \\begin{${env}} and \\end{${env}} (${beginCount} begin, ${endCount} end)`,
          );
          isValid = false;
        }
      }

      // Check for common LaTeX syntax errors
      if (latexCode.includes("\\begin{") && !latexCode.includes("\\end{")) {
        errors.push("Found \\begin{ without corresponding \\end{");
        isValid = false;
      }

      // Check for unclosed braces
      const openBraces = (latexCode.match(/\{/g) || []).length;
      const closeBraces = (latexCode.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push(
          `Mismatched braces (${openBraces} open, ${closeBraces} close)`,
        );
        isValid = false;
      }

      // Check for proper document structure order
      const docClassIndex = latexCode.indexOf("\\documentclass");
      const beginDocIndex = latexCode.indexOf("\\begin{document}");
      const endDocIndex = latexCode.indexOf("\\end{document}");

      if (docClassIndex > beginDocIndex) {
        errors.push("\\documentclass must come before \\begin{document}");
        isValid = false;
      }

      if (beginDocIndex > endDocIndex) {
        errors.push("\\begin{document} must come before \\end{document}");
        isValid = false;
      }

      // Check for incomplete commands
      if (
        latexCode.includes("\\") &&
        latexCode.match(/\\[a-zA-Z]+(?![a-zA-Z{}])/)
      ) {
        console.warn("⚠️ Potentially incomplete LaTeX commands detected");
      }

      console.log(
        isValid
          ? "✅ LaTeX structure validation passed"
          : "❌ LaTeX structure validation failed",
      );
      return { isValid, errors };
    } catch (error) {
      console.error("❌ LaTeX validation error:", error);
      return { isValid: false, errors: [`Validation error: ${error.message}`] };
    }
  }

  static analyzeLatexError(errorMessage) {
    const analysis = {
      undefinedCommands: [],
      missingPackages: [],
      structuralIssues: [],
      recommendations: [],
    };

    try {
      // Extract undefined control sequences
      const undefinedMatches = errorMessage.match(
        /Undefined control sequence[^\\]*\\([a-zA-Z]+)/g,
      );
      if (undefinedMatches) {
        undefinedMatches.forEach((match) => {
          const cmd = match.match(/\\([a-zA-Z]+)/);
          if (cmd && cmd[1]) {
            analysis.undefinedCommands.push(cmd[1]);
          }
        });
      }

      // Map common undefined commands to required packages
      const packageMap = {
        color: "xcolor",
        textcolor: "xcolor",
        href: "hyperref",
        url: "url",
        vspace: "none", // built-in but might need proper syntax
        hspace: "none",
        quad: "none", // built-in
        textbf: "none", // built-in
        textit: "none", // built-in
        Large: "none", // built-in
        section: "none", // built-in
        subsection: "none", // built-in
      };

      analysis.undefinedCommands.forEach((cmd) => {
        if (packageMap[cmd] && packageMap[cmd] !== "none") {
          if (!analysis.missingPackages.includes(packageMap[cmd])) {
            analysis.missingPackages.push(packageMap[cmd]);
          }
        }
      });

      // Generate recommendations
      if (analysis.undefinedCommands.length > 0) {
        analysis.recommendations.push(
          "Define or include packages for undefined commands",
        );
      }
      if (analysis.missingPackages.length > 0) {
        analysis.recommendations.push(
          `Add packages: ${analysis.missingPackages.join(", ")}`,
        );
      }

      console.log("🔍 Error analysis:", analysis);
      return analysis;
    } catch (error) {
      console.error("❌ Error analysis failed:", error);
      return analysis;
    }
  }

  static generateImprovedPrompt(
    templateName,
    resumeData,
    errorAnalysis,
    attemptNumber,
  ) {
    // Extract data from resumeData structure (similar to generatePrompt)
    const personal = resumeData.personalDetail || {};
    const summary = resumeData.summary || "";
    const work = resumeData.work || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const certifications = resumeData.certifications || [];
    const education = resumeData.education || [];

    // Helper function to clean HTML content
    const cleanHtml = (text) => {
      if (!text) return "";
      return text
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };

    // Helper function to format dates to "May 2024" format
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return dateString; // Return original if formatting fails
      }
    };

    const fullName =
      `${personal.firstName || ""} ${personal.lastName || ""}`.trim();
    const jobTitle = personal.jobTitle || "";
    const contact = {
      email: personal.email || "",
      phone: personal.phone || "",
      address: personal.address || "",
      linkedin: personal.linkedin || "",
      github: personal.github || "",
      portfolio: personal.portfolio || "",
    };

    const workExperience = work.map((job) => ({
      title: job.title || "",
      company: job.companyName || "",
      startDate: job.startDate || "",
      endDate: job.currentlyWorking ? "Present" : job.endDate || "",
      description: cleanHtml(job.workSummery || ""),
    }));

    const educationHistory = education.map((edu) => ({
      degree: edu.degree || "",
      school: edu.school || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      graduationDate: edu.graduationDate || "",
      // Handle both old cgpa field and new grade structure
      cgpa: edu.gradeValue || edu.cgpa || "",
      gradeValue: edu.gradeValue || edu.cgpa || "",
      gradeType: edu.gradeType || (edu.cgpa ? "cgpa" : ""),
    }));

    const skillsList = Array.isArray(skills)
      ? skills
          .map((skill) => {
            if (typeof skill === "object" && skill.skills) {
              return `${skill.category}: ${skill.skills}`;
            }
            return skill.name || skill;
          })
          .filter(Boolean)
      : [];

    const projectsList = projects.map((project) => ({
      title: project.title || project.name || "",
      description: cleanHtml(project.description || ""),
      technologies: project.techStack || project.technologies || "",
      startDate: formatDate(project.startDate) || "",
      endDate: formatDate(project.endDate) || "",
      liveDemo: project.liveDemo || "",
      githubRepo: project.githubRepo || "",
      url: project.projectUrl || "",
      bullets: project.bullets || [], // Include bullets in the mapping
    }));

    const certificationsList = certifications.map((cert) => ({
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: formatDate(cert.date) || "",
      expirationDate: formatDate(cert.expirationDate) || "",
      link: cert.link || "",
      description: cleanHtml(cert.description || ""),
    }));

    // Build error-specific corrections
    let errorCorrections = "";
    if (errorAnalysis.undefinedCommands.length > 0) {
      errorCorrections += `\n\nPREVIOUS ATTEMPT FAILED - CRITICAL FIXES NEEDED:
❌ Undefined commands found: ${errorAnalysis.undefinedCommands.map((cmd) => `\\${cmd}`).join(", ")}

REQUIRED CORRECTIONS:
- Include ALL necessary packages in preamble
- Use only standard LaTeX commands or properly define custom commands
- NO undefined control sequences allowed`;
    }

    if (errorAnalysis.missingPackages.length > 0) {
      errorCorrections += `\n- MUST include packages: ${errorAnalysis.missingPackages.join(", ")}`;
    }

    // Template-specific requirements
    let templateRequirements = "";
    if (templateName === "Jake") {
      templateRequirements = `
JAKE TEMPLATE SPECIFIC REQUIREMENTS:
- Use EXACT preamble: \\documentclass[a4paper,11pt]{article}
- Required packages: latexsym, fullpage, titlesec, marvosym, color, verbatim, enumitem, hyperref, fancyhdr, babel, tabularx

⚠️  MANDATORY SECTION ORDER (DO NOT CHANGE):
1. Professional Summary (first)
2. Experience
3. Technical Skills 
4. Projects
5. Certifications
6. Education (MUST BE LAST SECTION - DO NOT MOVE)

CRITICAL - SECTION FORMATTING WITH BLACK LINES:
- MUST include this EXACT command:
  \\titleformat{\\section}{\\vspace{-4pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]
- Use \\section{Section Name} NOT \\section*{Section Name} (asterisk removes lines)
- Every section MUST have a black horizontal line underneath
- Education section MUST be the final section before \\end{document}

EXACT COMMAND DEFINITIONS REQUIRED:
- \\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
- \\newcommand{\\resumeSubheading}[4]{\\vspace{-2pt}\\item\\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}\\textbf{#1} & #2 \\\\\\textit{\\small#3} & \\textit{\\small #4} \\\\\\end{tabular*}\\vspace{-7pt}}
- \\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
- \\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}

VISUAL REQUIREMENTS:
- Header format: \\textbf{\\Huge \\scshape NAME} with contact info below
- BLACK horizontal lines under ALL section headers (this is mandatory)
- Professional spacing and alignment`;
    } else {
      templateRequirements = `
STANDARD TEMPLATE REQUIREMENTS:
- Basic packages: geometry, hyperref, xcolor, enumitem, titlesec
- Clean section headers with \\section*{} 
- Professional formatting with proper spacing`;
    }

    const improvedPrompt = `RETRY ATTEMPT ${attemptNumber}: Generate a professional resume using the "${templateName}" template style.

${errorCorrections}
${templateRequirements}

TEMPLATE: ${templateName}

RESUME DATA:
Personal Information:
- Name: ${fullName}
- Job Title: ${jobTitle}
- Email: ${contact.email}
- Phone: ${contact.phone}
- Address: ${contact.address}
- LinkedIn: ${contact.linkedin}
- GitHub: ${contact.github}
- Portfolio: ${contact.portfolio}

Professional Summary:
${summary}

Work Experience:
${workExperience
  .map(
    (job, index) => `
${index + 1}. ${job.title} at ${job.company}
   Duration: ${job.startDate} - ${job.endDate}
   Description: ${job.description}
`,
  )
  .join("")}

Education:
${educationHistory
  .map(
    (edu, index) => `
${index + 1}. ${edu.degree}
   Institution: ${edu.school}
   Field of Study: ${edu.fieldOfStudy}
   Graduation Date: ${edu.graduationDate}
   CGPA: ${edu.cgpa || "Not specified"}
`,
  )
  .join("")}

Skills:
${skillsList.join(", ")}

Projects:
${projectsList
  .map(
    (project, index) => `
${index + 1}. ${project.title}
   Description: ${project.description}
   Highlights/Bullets: ${project.bullets && project.bullets.length > 0 ? project.bullets.filter((b) => b && b.trim()).join(" | ") : "None"}
   Technologies: ${project.technologies}
   Live Demo: ${project.liveDemo}
   GitHub Repo: ${project.githubRepo}
   URL: ${project.url}
`,
  )
  .join("")}

Certifications:
${certificationsList
  .map(
    (cert, index) => `
${index + 1}. ${cert.name}
   Issuer: ${cert.issuer}
   Date Obtained: ${cert.date}
   Expiration Date: ${cert.expirationDate || "No expiration"}
   Link: ${cert.link || "Not provided"}
   Description: ${cert.description}
`,
  )
  .join("")}

CRITICAL REQUIREMENTS FOR THIS RETRY:
1. ONLY use standard LaTeX commands that are built-in or from the packages listed above
2. Include ALL necessary \\usepackage declarations in the preamble
3. NO custom commands like \\color{textcolor} without defining textcolor first
4. Use \\textcolor{blue}{text} instead of \\color{textcolor}
5. Every \\begin MUST have matching \\end
6. Test all commands - they must be standard LaTeX
7. If using colors, define them first: \\definecolor{name}{HTML}{value}

Generate a complete, error-free LaTeX document that will compile successfully. Return ONLY the LaTeX code from \\documentclass to \\end{document}.`;

    return improvedPrompt;
  }

  static generateJakeFallbackLatex(resumeData) {
    const personal = resumeData.personalDetail || {};
    const work = resumeData.work || [];
    const education = resumeData.education || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const certifications = resumeData.certifications || [];

    const fullName =
      `${personal.firstName || ""} ${personal.lastName || ""}`.trim();

    const escapeLatex = (text) => {
      if (!text) return "";
      let str = typeof text === "string" ? text : String(text);
      str = str
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

      return str
        .replace(/\\/g, "\\textbackslash{}")
        .replace(/[&%$#_{}]/g, "\\$&")
        .replace(/\^/g, "\\textasciicircum{}")
        .replace(/~/g, "\\textasciitilde{}");
    };

    // Helper function to format dates to "May 2024" format
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return dateString; // Return original if formatting fails
      }
    };

    return `\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\pdfgentounicode=1

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(fullName)}} \\\\ \\vspace{1pt}
    ${personal.address ? `\\small \\faIcon{map-marker-alt} \\ ${escapeLatex(personal.address)} \\\\` : ""}
    \\small \\faIcon{phone} \\ ${escapeLatex(personal.phone || "")} \\textbf{\\textperiodcentered} \\faIcon{envelope} \\ \\href{mailto:${escapeLatex(personal.email || "")}}{${escapeLatex(personal.email || "")}} \\textbf{\\textperiodcentered} 
    \\faIcon{linkedin} \\ \\href{${escapeLatex(personal.linkedin || "")}}{LinkedIn} \\textbf{\\textperiodcentered}
    \\faIcon{github} \\ \\href{${escapeLatex(personal.github || "")}}{GitHub}${personal.portfolio ? ` \\textbf{\\textperiodcentered} \\faIcon{globe} \\ \\href{${escapeLatex(personal.portfolio)}}{Portfolio}` : ""}
\\end{center}

\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
        ${escapeLatex(resumeData.summary || "Dedicated professional with strong technical skills and experience.")}
    }}
\\end{itemize}

\\section{Experience}
\\resumeSubHeadingListStart
${work
  .map(
    (job) => `  \\resumeSubheading
    {${escapeLatex(job.title || "")}}{${escapeLatex(formatDate(job.startDate) || "")} -- ${escapeLatex(job.currentlyWorking ? "Present" : formatDate(job.endDate) || "")}}
    {${escapeLatex(job.companyName || "")}}{${escapeLatex(job.location || personal.address || "Remote")}}
    \\resumeItemListStart
      \\resumeItem{${escapeLatex(job.workSummery || job.workSummary || "Contributed to team projects and company objectives.")}}
    \\resumeItemListEnd`,
  )
  .join("\n")}
\\resumeSubHeadingListEnd

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
        \\textbf{Programming Languages}: ${skills.filter((s) => typeof s === "string" && (s.toLowerCase().includes("python") || s.toLowerCase().includes("java") || s.toLowerCase().includes("javascript") || s.toLowerCase().includes("c++"))).join(", ") || "Python, JavaScript, Java"} \\\\
        \\textbf{Frameworks}: ${skills.filter((s) => typeof s === "string" && (s.toLowerCase().includes("react") || s.toLowerCase().includes("node") || s.toLowerCase().includes("django") || s.toLowerCase().includes("express"))).join(", ") || "React, Node.js, Express"} \\\\
        \\textbf{Tools}: ${skills.filter((s) => typeof s === "string" && (s.toLowerCase().includes("git") || s.toLowerCase().includes("docker") || s.toLowerCase().includes("aws"))).join(", ") || "Git, Docker, AWS"}
    }}
\\end{itemize}

\\section{Projects}
\\resumeSubHeadingListStart
${
  projects.length > 0
    ? projects
        .map((project) => {
          // Build links section like header style
          let linksSection = "";
          if (project.liveDemo || project.githubRepo) {
            const links = [];
            if (project.liveDemo) {
              links.push(
                `\\href{${escapeLatex(project.liveDemo)}}{\\faIcon{link} \\ \\textbf{Live}}`,
              );
            }
            if (project.githubRepo) {
              links.push(
                `\\href{${escapeLatex(project.githubRepo)}}{\\faIcon{github} \\ \\textbf{Code}}`,
              );
            }
            linksSection = ` \\textbf{\\textperiodcentered} ${links.join(" \\textbf{\\textperiodcentered} ")}`;
          }

          const projectItems = [];
          // Add description if available
          if (project.description && project.description.trim()) {
            projectItems.push(
              `      \\resumeItem{${escapeLatex(project.description)}}`,
            );
          }

          // Add bullets/highlights if available
          if (project.bullets && Array.isArray(project.bullets)) {
            const validBullets = project.bullets.filter(
              (bullet) => bullet && bullet.trim(),
            );
            validBullets.forEach((bullet) => {
              projectItems.push(`      \\resumeItem{${escapeLatex(bullet)}}`);
            });
          }

          // If no content, add default
          if (projectItems.length === 0) {
            projectItems.push(
              `      \\resumeItem{Project description and key achievements.}`,
            );
          }

          // Format project date range
          let projectDate = "2024"; // Default fallback
          if (project.startDate && project.endDate) {
            projectDate = `${project.startDate} - ${project.endDate}`;
          } else if (project.startDate) {
            projectDate = project.startDate;
          } else if (project.endDate) {
            projectDate = project.endDate;
          }

          return `  \\resumeProjectHeading
    {\\textbf{${escapeLatex(project.title || project.name || "Project Name")}} \\textbf{\\textperiodcentered} \\emph{${escapeLatex(project.technologies || project.techStack || "Technology Stack")}}${linksSection}}{${escapeLatex(projectDate)}}
    \\resumeItemListStart
${projectItems.join("\n")}
    \\resumeItemListEnd`;
        })
        .join("\n")
    : `  \\resumeProjectHeading
    {\\textbf{Sample Project} \\textbf{\\textperiodcentered} \\emph{Technology Stack}}{2024}
    \\resumeItemListStart
      \\resumeItem{Developed innovative solutions using modern technologies.}
    \\resumeItemListEnd`
}
\\resumeSubHeadingListEnd

\\section{Certifications}
\\resumeSubHeadingListStart
${
  certifications.length > 0
    ? certifications
        .map((cert) => {
          // Build links section for certifications with proper spacing and alignment
          let linksSection = "";
          if (cert.link) {
            linksSection = ` \\textbf{\\textperiodcentered} \\href{${cert.link}}{\\faIcon{link} \\ \\textbf{\\small Link}}`;
          }

          return `  \\resumeSubheading
    {${escapeLatex(cert.name || "Sample Certification")}${linksSection}}{${escapeLatex(formatDate(cert.date) || "2024")}}
    {${escapeLatex(cert.issuer || "Issuing Organization")}}{${escapeLatex(cert.expirationDate ? `Expires: ${formatDate(cert.expirationDate)}` : "")}}${
      cert.description
        ? `
    \\resumeItemListStart
      \\resumeItem{${escapeLatex(cert.description)}}
    \\resumeItemListEnd`
        : ""
    }`;
        })
        .join("\n")
    : `  \\resumeSubheading
    {Sample Certification}{2024}
    {Issuing Organization}{}`
}
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingListStart
${education
  .map(
    (edu) => `  \\resumeSubheading
    {${escapeLatex(edu.school || "University Name")}}{${escapeLatex(formatDate(edu.graduationDate) || "2024")}}
    {${escapeLatex(edu.degree || "Bachelor of Science")}${edu.fieldOfStudy ? ` in ${escapeLatex(edu.fieldOfStudy)}` : ""}${edu.cgpa || edu.gradeValue ? ` (${edu.gradeType === "percentage" ? "Percentage" : "CGPA"}: ${escapeLatex(edu.cgpa || edu.gradeValue)})` : ""}}{}
`,
  )
  .join("\n")}
\\resumeSubHeadingListEnd

\\end{document}`;
  }

  static ensureJakeTemplateFormatting(latexCode) {
    let fixed = latexCode;

    try {
      console.log(
        "🎨 Ensuring Jake template formatting with separation lines...",
      );

      // Check if titleformat is already defined for sections
      const hasTitleFormat = fixed.includes("\\titleformat{\\section}");
      const hasRequiredPackages =
        fixed.includes("\\usepackage{titlesec}") &&
        fixed.includes("\\usepackage[usenames,dvipsnames]{color}");

      if (!hasTitleFormat || !hasRequiredPackages) {
        console.log("🔧 Adding missing Jake template formatting...");

        // Find the position to insert packages and titleformat
        const beginDocIndex = fixed.indexOf("\\begin{document}");
        if (beginDocIndex !== -1) {
          // Extract preamble and document content
          const preamble = fixed.substring(0, beginDocIndex);
          const document = fixed.substring(beginDocIndex);

          let newPreamble = preamble;

          // Add missing packages if not present
          if (!newPreamble.includes("\\usepackage{titlesec}")) {
            newPreamble += "\\usepackage{titlesec}\n";
          }
          if (
            !newPreamble.includes("\\usepackage[usenames,dvipsnames]{color}")
          ) {
            newPreamble += "\\usepackage[usenames,dvipsnames]{color}\n";
          }

          // Add titleformat command for section separation lines
          if (!hasTitleFormat) {
            newPreamble += `
% Section formatting with separation lines
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

`;
          }

          fixed = newPreamble + document;
        }
      }

      // Ensure sections use \section{} not \section*{} for separation lines to show
      fixed = fixed.replace(/\\section\*\{/g, "\\section{");

      // Fix common Jake template issues
      // Ensure proper spacing commands are available
      if (!fixed.includes("\\raggedbottom")) {
        const beginDocIndex = fixed.indexOf("\\begin{document}");
        if (beginDocIndex !== -1) {
          const beforeDoc = fixed.substring(0, beginDocIndex);
          const afterDoc = fixed.substring(beginDocIndex);
          fixed =
            beforeDoc +
            "\\raggedbottom\n\\raggedright\n\\setlength{\\tabcolsep}{0in}\n\n" +
            afterDoc;
        }
      }

      console.log("✅ Jake template formatting ensured");
      return fixed;
    } catch (error) {
      console.error("❌ Jake template formatting failed:", error);
      return latexCode; // Return original if formatting fails
    }
  }

  static generateJakeSpecificPrompt(resumeData) {
    // Extract data from resumeData structure
    const personal = resumeData.personalDetail || {};
    const summary = resumeData.summary || "";
    const work = resumeData.work || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const certifications = resumeData.certifications || [];
    const education = resumeData.education || [];

    // Helper function to clean HTML content
    const cleanHtml = (text) => {
      if (!text) return "";
      return text
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    };

    // Helper function to format dates to "May 2024" format
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return dateString; // Return original if formatting fails
      }
    };

    const fullName =
      `${personal.firstName || ""} ${personal.lastName || ""}`.trim();
    const jobTitle = personal.jobTitle || "";
    const contact = {
      email: personal.email || "",
      phone: personal.phone || "",
      address: personal.address || "",
      linkedin: personal.linkedin || "",
      github: personal.github || "",
      portfolio: personal.portfolio || "",
    };

    const workExperience = work.map((job) => ({
      title: job.title || "",
      company: job.companyName || "",
      startDate: formatDate(job.startDate) || "",
      endDate: job.currentlyWorking ? "Present" : formatDate(job.endDate) || "",
      description: cleanHtml(job.workSummery || ""),
    }));

    const educationHistory = education.map((edu) => ({
      degree: edu.degree || "",
      school: edu.school || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      graduationDate: formatDate(edu.graduationDate) || "",
      // Handle both old cgpa field and new grade structure
      cgpa: edu.gradeValue || edu.cgpa || "",
      gradeValue: edu.gradeValue || edu.cgpa || "",
      gradeType: edu.gradeType || (edu.cgpa ? "cgpa" : ""),
      description: cleanHtml(edu.description || ""), // Clean HTML content from education description
    }));

    const skillsList = Array.isArray(skills)
      ? skills
          .map((skill) => {
            if (typeof skill === "object" && skill.skills) {
              return `${skill.category}: ${skill.skills}`;
            }
            return skill.name || skill;
          })
          .filter(Boolean)
      : [];

    const projectsList = projects.map((project) => ({
      title: project.title || project.name || "",
      description: cleanHtml(project.description || ""),
      technologies: project.techStack || project.technologies || "",
      startDate: formatDate(project.startDate) || "",
      endDate: formatDate(project.endDate) || "",
      liveDemo: project.liveDemo || "",
      githubRepo: project.githubRepo || "",
      url: project.projectUrl || "",
      bullets: project.bullets || [], // Include bullets in the mapping
    }));

    const certificationsList = certifications.map((cert) => ({
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: formatDate(cert.date) || "",
      expirationDate: formatDate(cert.expirationDate) || "",
      link: cert.link || "",
      description: cleanHtml(cert.description || ""),
    }));

    const prompt = `Generate a JAKE TEMPLATE resume with this EXACT format and structure.

⚠️  CRITICAL SECTION ORDER REQUIREMENT: The sections MUST appear in this EXACT order:
1. Professional Summary (first)
2. Experience
3. Skills 
4. Projects
5. Certifications
6. Education (MUST BE LAST - DO NOT MOVE THIS SECTION)

DO NOT change or reorder these sections. Education MUST be the final section before \\end{document}.

\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\pdfgentounicode=1

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${fullName}} \\\\ \\vspace{1pt}
    ${contact.address ? `\\small \\faIcon{map-marker-alt} \\ ${contact.address} \\\\` : ""}
    \\small \\faIcon{phone} \\ ${contact.phone} \\textbf{\\textperiodcentered} \\faIcon{envelope} \\ \\href{mailto:${contact.email}}{${contact.email}} \\textbf{\\textperiodcentered} 
    \\faIcon{linkedin} \\ \\href{${contact.linkedin}}{LinkedIn} \\textbf{\\textperiodcentered}
    \\faIcon{github} \\ \\href{${contact.github}}{GitHub}${contact.portfolio ? ` \\textbf{\\textperiodcentered} \\faIcon{globe} \\ \\href{${contact.portfolio}}{Portfolio}` : ""}
\\end{center}

\\section{Professional Summary}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
        ${cleanHtml(summary) || "Dedicated professional with strong technical skills and experience."}
    }}
\\end{itemize}

\\section{Experience}
\\resumeSubHeadingListStart
${workExperience
  .map(
    (job) => `  \\resumeSubheading
    {${job.title}}{${job.startDate} -- ${job.endDate}}
    {${job.company}}{${contact.address || "Remote"}}
    \\resumeItemListStart
      \\resumeItem{${job.description}}
    \\resumeItemListEnd`,
  )
  .join("\n")}
\\resumeSubHeadingListEnd

\\section{Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
        \\textbf{Programming Languages}: ${skillsList.filter((s) => s.toLowerCase().includes("python") || s.toLowerCase().includes("java") || s.toLowerCase().includes("javascript") || s.toLowerCase().includes("c++")).join(", ") || "Python, JavaScript, Java"} \\\\
        \\textbf{Frameworks}: ${skillsList.filter((s) => s.toLowerCase().includes("react") || s.toLowerCase().includes("node") || s.toLowerCase().includes("django") || s.toLowerCase().includes("express")).join(", ") || "React, Node.js, Express"} \\\\
        \\textbf{Tools}: ${skillsList.filter((s) => s.toLowerCase().includes("git") || s.toLowerCase().includes("docker") || s.toLowerCase().includes("aws")).join(", ") || "Git, Docker, AWS"}
    }}
\\end{itemize}

\\section{Projects}
\\resumeSubHeadingListStart
${projectsList
  .map((project) => {
    // Build links section like header style
    let linksSection = "";
    if (project.liveDemo || project.githubRepo) {
      const links = [];
      if (project.liveDemo) {
        links.push(`\\href{${project.liveDemo}}{\\faIcon{link} \\ \\textbf{Live}}`);
      }
      if (project.githubRepo) {
        links.push(`\\href{${project.githubRepo}}{\\faIcon{github} \\ \\textbf{Code}}`);
      }
      linksSection = ` \\textbf{\\textperiodcentered} ${links.join(" \\textbf{\\textperiodcentered} ")}`;
    }

    const projectItems = [];
    // Add description if available
    if (project.description && project.description.trim()) {
      projectItems.push(`      \\resumeItem{${project.description}}`);
    }

    // Add bullets/highlights if available - this is crucial for complete project rendering
    if (project.bullets && Array.isArray(project.bullets)) {
      const validBullets = project.bullets.filter(
        (bullet) => bullet && bullet.trim(),
      );
      validBullets.forEach((bullet) => {
        projectItems.push(`      \\resumeItem{${bullet}}`);
      });
    }

    // If no content, add default
    if (projectItems.length === 0) {
      projectItems.push(
        `      \\resumeItem{${project.description || "Project description and key achievements."}}`,
      );
    }

    // Format project date range
    let projectDate = new Date().getFullYear().toString(); // Default fallback to current year
    if (project.startDate && project.endDate) {
      projectDate = `${project.startDate} - ${project.endDate}`;
    } else if (project.startDate) {
      projectDate = project.startDate;
    } else if (project.endDate) {
      projectDate = project.endDate;
    }

    return `  \\resumeProjectHeading
    {\\textbf{${project.title}} \\textbf{\\textperiodcentered} \\emph{${project.technologies}}${linksSection}}{${projectDate}}
    \\resumeItemListStart
${projectItems.join("\n")}
    \\resumeItemListEnd`;
  })
  .join("\n")}
\\resumeSubHeadingListEnd

\\section{Certifications}
\\resumeSubHeadingListStart
${
  certificationsList.length > 0
    ? certificationsList
        .map((cert) => {
          // Build links section for certifications with proper alignment
          let linksSection = "";
          if (cert.link) {
            linksSection = ` \\href{${cert.link}}{\\faIcon{link} \\ \\textbf{\\small Link}}`;
          }
          return `  \\resumeSubheading
    {${cert.name}${linksSection}}{${cert.date}}
    {\\textit{${cert.issuer}}}{${cert.expirationDate ? `Expires: ${cert.expirationDate}` : ""}}${
      cert.description
        ? `
    \\resumeItemListStart
      \\resumeItem{${cert.description}}
    \\resumeItemListEnd`
        : ""
    }`;
        })
        .join("\n")
    : `  \\resumeSubheading
    {Sample Certification}{2024}
    {Issuing Organization}{}`
}
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingListStart
${educationHistory
  .map(
    (edu) => `  \\resumeSubheading
    {${edu.school}}{${edu.graduationDate}}
    {${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}${edu.cgpa || edu.gradeValue ? ` (${edu.gradeType === "percentage" ? "Percentage" : "CGPA"}: ${edu.cgpa || edu.gradeValue})` : ""}}{}${
      edu.description
        ? `
    \\resumeItemListStart
      \\resumeItem{${edu.description}}
    \\resumeItemListEnd`
        : ""
    }`,
  )
  .join("\n")}
\\resumeSubHeadingListEnd

\\end{document}

CRITICAL REQUIREMENTS:
1. Use this EXACT structure above
2. NO section numbers (1, 2, 3, etc.)
3. Black horizontal lines under each section (from \\titlerule)
4. Clean, modern formatting like shown
5. Replace placeholder data with actual resume data provided below
6. IMPORTANT: For projects, include BOTH description AND all project highlights/bullets as separate \\resumeItem{} entries
7. Each project bullet point should be its own \\resumeItem{} in the \\resumeItemListStart section
8. MANDATORY SECTION ORDER: Professional Summary → Experience → Skills → Projects → Certifications → Education (EDUCATION MUST BE LAST SECTION)
9. CRITICAL: For certification links, use EXACTLY this text: "Link" (NOT "Certificate" or any other text)
10. CRITICAL: For education grades, show CGPA/Percentage values exactly as provided in the data

RESUME DATA:
Name: ${fullName}
Job Title: ${jobTitle}
Email: ${contact.email}
Phone: ${contact.phone}
LinkedIn: ${contact.linkedin}
GitHub: ${contact.github}
Portfolio: ${contact.portfolio}

Professional Summary: ${summary}

Work Experience:
${workExperience
  .map(
    (job, index) => `
${index + 1}. ${job.title} at ${job.company}
   Duration: ${job.startDate} - ${job.endDate}
   Description: ${job.description}
`,
  )
  .join("")}

Education:
${educationHistory
  .map(
    (edu, index) => `
${index + 1}. ${edu.degree} from ${edu.school}
   Field: ${edu.fieldOfStudy}
   Graduation: ${edu.graduationDate}
   ${edu.gradeType === "percentage" ? "Percentage" : "CGPA"}: ${edu.cgpa || edu.gradeValue || "Not specified"}
   Description: ${edu.description}
`,
  )
  .join("")}

Skills: ${skillsList.join(", ")}

Projects:
${projectsList
  .map(
    (project, index) => `
${index + 1}. ${project.title}
   ${project.startDate || project.endDate ? `Duration: ${project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : project.startDate || project.endDate}` : ""}
   Technologies: ${project.technologies}
   Description: ${project.description}
   Highlights/Bullets: ${project.bullets && project.bullets.length > 0 ? project.bullets.filter((b) => b && b.trim()).join(" | ") : "None"}
   Live Demo: ${project.liveDemo}
   GitHub Repo: ${project.githubRepo}
`,
  )
  .join("")}

Certifications:
${certificationsList
  .map(
    (cert, index) => `
${index + 1}. ${cert.name}
   Issuer: ${cert.issuer}
   Date Obtained: ${cert.date}
   Expiration Date: ${cert.expirationDate || "No expiration"}
   Link: ${cert.link || "Not provided"}
   Description: ${cert.description}
`,
  )
  .join("")}

Generate the complete LaTeX code using the EXACT Jake template structure above. 

🚨 FINAL REMINDER: Education section MUST be the LAST section in the document before \\end{document}. Do NOT place it anywhere else.

Return ONLY the LaTeX code.`;

    return prompt;
  }
}

export default TemplateAiService;
