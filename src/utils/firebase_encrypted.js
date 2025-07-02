import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { app } from "./firebase_config";
import { getCurrentUserEmail, handleFirebaseError } from "./firebase_helpers";
import EncryptionService from "./encryption";
import { getAuth } from "firebase/auth";
import Logger from "./logger.js";

class EncryptedFirebaseService {
  constructor() {
    this.db = getFirestore(app);
  }

  // Get encryption key for current user
  getUserEncryptionKey() {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return EncryptionService.generateUserKey(currentUser.email, currentUser.uid);
  }

  // Save encrypted resume data
  async saveResumeData(userEmail, resumeId, resumeData, options = { merge: false }) {
    try {
      const key = this.getUserEncryptionKey();
      const encryptedData = EncryptionService.encryptResumeData(resumeData, key);
      
      const resumeRef = doc(this.db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
      
      await setDoc(resumeRef, encryptedData, { merge: options.merge });
      
      Logger.log('✅ Encrypted resume data saved successfully');
      return { success: true };
      
    } catch (error) {
      Logger.error('❌ Error saving encrypted resume:', error);
      handleFirebaseError(error, 'save encrypted resume');
      throw error;
    }
  }

  // Get and decrypt resume data
  async getResumeData(userEmail, resumeId) {
    try {
      const key = this.getUserEncryptionKey();
      
      const resumeRef = doc(this.db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
      const resumeSnap = await getDoc(resumeRef);
      
      if (!resumeSnap.exists()) {
        throw new Error('Resume not found');
      }
      
      const encryptedData = resumeSnap.data();
      const decryptedData = EncryptionService.decryptResumeData(encryptedData, key);
      
      Logger.log('✅ Resume data decrypted successfully');
      return decryptedData;
      
    } catch (error) {
      Logger.error('❌ Error getting encrypted resume:', error);
      handleFirebaseError(error, 'get encrypted resume');
      throw error;
    }
  }

  // Update specific encrypted field
  async updateResumeField(userEmail, resumeId, fieldName, fieldData) {
    try {
      const key = this.getUserEncryptionKey();
      
      const sensitiveFields = ['personalDetail', 'summary', 'experience', 'skills', 'projects', 'education', 'pdfBase64', 'latexCode'];
      
      let updateData = {};
      
      if (sensitiveFields.includes(fieldName)) {
        updateData[fieldName] = EncryptionService.encryptData(fieldData, key);
        updateData.isEncrypted = true;
        updateData.encryptionVersion = '1.0';
      } else {
        updateData[fieldName] = fieldData;
      }
      
      updateData.updatedAt = new Date().toISOString();
      
      const resumeRef = doc(this.db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
      await setDoc(resumeRef, updateData, { merge: true });
      
      Logger.log(`✅ Encrypted field ${fieldName} updated successfully`);
      return { success: true };
      
    } catch (error) {
      Logger.error(`❌ Error updating encrypted field ${fieldName}:`, error);
      handleFirebaseError(error, `update encrypted field ${fieldName}`);
      throw error;
    }
  }

  // Update multiple encrypted fields at once
  async updateResumeFields(userEmail, resumeId, fieldsData) {
    try {
      const key = this.getUserEncryptionKey();
      
      const sensitiveFields = ['personalDetail', 'summary', 'experience', 'skills', 'projects', 'education', 'pdfBase64', 'latexCode'];
      
      let updateData = {};
      let hasEncryptedFields = false;
      
      Object.entries(fieldsData).forEach(([fieldName, fieldData]) => {
        if (sensitiveFields.includes(fieldName)) {
          updateData[fieldName] = EncryptionService.encryptData(fieldData, key);
          hasEncryptedFields = true;
        } else {
          updateData[fieldName] = fieldData;
        }
      });
      
      if (hasEncryptedFields) {
        updateData.isEncrypted = true;
        updateData.encryptionVersion = '1.0';
      }
      
      updateData.updatedAt = new Date().toISOString();
      
      const resumeRef = doc(this.db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
      await setDoc(resumeRef, updateData, { merge: true });
      
      Logger.log('✅ Encrypted fields updated successfully');
      return { success: true };
      
    } catch (error) {
      Logger.error('❌ Error updating encrypted fields:', error);
      handleFirebaseError(error, 'update encrypted fields');
      throw error;
    }
  }

  // Get all resumes (metadata only, content encrypted)
  async getAllResumes(userEmail) {
    try {
      const resumesRef = collection(this.db, `usersByEmail/${userEmail}/resumes`);
      const querySnapshot = await getDocs(resumesRef);
      
      const resumes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only return metadata, not encrypted content
        resumes.push({
          id: doc.id,
          resumeId: data.resumeId,
          title: data.title,
          templateId: data.templateId,
          templateName: data.templateName,
          aiTemplateName: data.aiTemplateName,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          status: data.status,
          themeColor: data.themeColor,
          isEncrypted: data.isEncrypted
        });
      });
      
      return resumes;
      
    } catch (error) {
      Logger.error('❌ Error getting resumes list:', error);
      handleFirebaseError(error, 'get resumes list');
      throw error;
    }
  }

  // Create new encrypted resume
  async createNewResume(userEmail, resumeData) {
    try {
      // Check resume limit before creating
      const resumeCount = await this.getResumeCount(userEmail);
      if (resumeCount >= 3) {
        throw new Error('RESUME_LIMIT_REACHED');
      }

      // Get next resume ID
      const resumesRef = collection(this.db, `usersByEmail/${userEmail}/resumes`);
      const q = query(resumesRef, orderBy("resumeId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let newResumeId = 1;
      if (!querySnapshot.empty) {
        const lastResume = querySnapshot.docs[0].data();
        newResumeId = (parseInt(lastResume.resumeId) || 0) + 1;
      }

      const resumeDataWithId = {
        ...resumeData,
        resumeId: newResumeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerationTimestamps: {
          summary: null,
          experience: null,
          skills: null,
          projects: null,
          education: null
        }
      };

      await this.saveResumeData(userEmail, newResumeId, resumeDataWithId);
      
      return { success: true, resumeId: newResumeId };
      
    } catch (error) {
      Logger.error('❌ Error creating encrypted resume:', error);
      handleFirebaseError(error, 'create encrypted resume');
      throw error;
    }
  }

  // Get resume count for a user
  async getResumeCount(userEmail) {
    try {
      const resumesRef = collection(this.db, `usersByEmail/${userEmail}/resumes`);
      const querySnapshot = await getDocs(resumesRef);
      return querySnapshot.size;
    } catch (error) {
      Logger.error('❌ Error getting resume count:', error);
      handleFirebaseError(error, 'get resume count');
      throw error;
    }
  }

  // Update AI generation timestamp for a specific section
  async updateAiGenerationTimestamp(userEmail, resumeId, section) {
    try {
      const timestamp = new Date().toISOString();
      const updateData = {
        [`aiGenerationTimestamps.${section}`]: timestamp,
        updatedAt: timestamp
      };
      
      const resumeRef = doc(this.db, `usersByEmail/${userEmail}/resumes`, `resume-${resumeId}`);
      await setDoc(resumeRef, updateData, { merge: true });
      
      Logger.log(`✅ AI generation timestamp updated for ${section}`);
      return { success: true };
      
    } catch (error) {
      Logger.error(`❌ Error updating AI timestamp for ${section}:`, error);
      handleFirebaseError(error, `update AI timestamp for ${section}`);
      throw error;
    }
  }

  // Check if AI regeneration is allowed (24-hour cooldown)
  canRegenerateAI(aiGenerationTimestamps, section) {
    if (!aiGenerationTimestamps || !aiGenerationTimestamps[section]) {
      return true; // No previous generation, allow
    }
    
    const lastGeneration = new Date(aiGenerationTimestamps[section]);
    const now = new Date();
    const hoursDifference = (now - lastGeneration) / (1000 * 60 * 60);
    
    return hoursDifference >= 24;
  }

  // Get time remaining for AI regeneration cooldown
  getAiCooldownTimeRemaining(aiGenerationTimestamps, section) {
    if (!aiGenerationTimestamps || !aiGenerationTimestamps[section]) {
      return 0;
    }
    
    const lastGeneration = new Date(aiGenerationTimestamps[section]);
    const now = new Date();
    const hoursRemaining = 24 - (now - lastGeneration) / (1000 * 60 * 60);
    
    return Math.max(0, hoursRemaining);
  }
}

export default new EncryptedFirebaseService(); 