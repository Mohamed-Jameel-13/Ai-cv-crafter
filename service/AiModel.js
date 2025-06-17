// Get API key from environment variable (.env.local file)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Debug logging
console.log('Environment check:', {
  hasApiKey: !!apiKey,
  keyLength: apiKey?.length,
  keyPrefix: apiKey?.substring(0, 4),
  envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

// Validate API key
if (!apiKey) {
  throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file');
}

class AIchatSession {
  static async sendMessage(prompt) {
    try {
      // Try multiple API endpoints to find the working one
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`
      ];

      let lastError = null;
      
      for (const url of endpoints) {
        try {
          const modelName = url.split('/models/')[1].split(':')[0];
          console.log(`Trying model: ${modelName}`);
          
          const requestBody = {
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const text = data.candidates[0].content.parts[0].text;
              console.log(`✅ Success with model: ${modelName}`);
              return text;
            }
          } else {
            const errorData = await response.json();
            console.log(`❌ Failed with model ${modelName}:`, response.status, errorData);
            lastError = new Error(`${modelName}: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.log(`❌ Error with model:`, error.message);
          lastError = error;
          continue; // Try next endpoint
        }
      }

      // If we get here, all endpoints failed
      throw lastError || new Error('All API endpoints failed');

    } catch (error) {
      console.error('Gemini API Error:', {
        message: error.message,
        stack: error.stack
      });

      if (error.message?.includes('API key not valid') || error.message?.includes('403')) {
        throw new Error('Invalid API key. Please check your .env.local file and get a new key from https://aistudio.google.com/app/apikey');
      }

      if (error.message?.includes('404')) {
        throw new Error('API endpoint not found. Your API key might not have access to Gemini models. Please try getting a new key from https://aistudio.google.com/app/apikey');
      }

      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

export { AIchatSession }; 