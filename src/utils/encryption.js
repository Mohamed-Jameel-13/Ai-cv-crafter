import CryptoJS from 'crypto-js';

class EncryptionService {
  constructor() {
    this.algorithm = 'AES';
  }

  // Generate a secure key from user's password/passphrase
  generateKeyFromPassword(password, salt = null) {
    if (!salt) {
      salt = CryptoJS.lib.WordArray.random(128/8);
    }
    
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    return {
      key: key.toString(),
      salt: salt.toString()
    };
  }

  // Generate encryption key from user's authentication data
  generateUserKey(userEmail, userUid) {
    // Use a combination of user email and Firebase UID as base
    const baseString = `${userEmail}:${userUid}:${import.meta.env.VITE_ENCRYPTION_PEPPER || 'default-pepper'}`;
    
    // Generate a deterministic but secure key
    const key = CryptoJS.SHA256(baseString).toString();
    return key;
  }

  // Encrypt sensitive data
  encryptData(data, key) {
    try {
      const dataString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(dataString, key).toString();
      
      return {
        encrypted: encrypted,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decryptData(encryptedData, key) {
    try {
      // Handle both old plain text and new encrypted format
      if (typeof encryptedData === 'string' || !encryptedData.encrypted) {
        // Data is not encrypted (backward compatibility)
        return encryptedData;
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) {
        throw new Error('Failed to decrypt - invalid key or corrupted data');
      }
      
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - please check your credentials');
    }
  }

  // Encrypt only sensitive fields
  encryptResumeData(resumeData, key) {
    const sensitiveFields = [
      'personalDetail',
      'summary', 
      'experience',
      'skills',
      'projects',
      'education',
      'pdfBase64',
      'latexCode'
    ];

    const encryptedResume = { ...resumeData };
    
    // Encrypt sensitive fields
    sensitiveFields.forEach(field => {
      if (resumeData[field]) {
        encryptedResume[field] = this.encryptData(resumeData[field], key);
      }
    });

    // Keep metadata unencrypted for querying
    return {
      ...encryptedResume,
      isEncrypted: true,
      encryptionVersion: '1.0'
    };
  }

  // Decrypt resume data
  decryptResumeData(encryptedResumeData, key) {
    if (!encryptedResumeData.isEncrypted) {
      // Data is not encrypted (backward compatibility)
      return encryptedResumeData;
    }

    const decryptedResume = { ...encryptedResumeData };
    
    const sensitiveFields = [
      'personalDetail',
      'summary',
      'experience', 
      'skills',
      'projects',
      'education',
      'pdfBase64',
      'latexCode'
    ];

    // Decrypt sensitive fields
    sensitiveFields.forEach(field => {
      if (encryptedResumeData[field] && encryptedResumeData[field].encrypted) {
        decryptedResume[field] = this.decryptData(encryptedResumeData[field], key);
      }
    });

    // Remove encryption metadata
    delete decryptedResume.isEncrypted;
    delete decryptedResume.encryptionVersion;

    return decryptedResume;
  }
}

export default new EncryptionService(); 