// Get Azure OpenAI configuration from environment variables
const azureEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const azureApiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
const azureApiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
const azureDeploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';

// Debug logging (without exposing sensitive data)
console.log('Azure OpenAI Environment check:', {
  hasEndpoint: !!azureEndpoint,
  hasApiKey: !!azureApiKey,
  apiVersion: azureApiVersion,
  deploymentName: azureDeploymentName,
  endpointPrefix: azureEndpoint?.split('.')[0] + '...' || 'not set',
  endpointFormat: azureEndpoint ? (azureEndpoint.includes('.openai.azure.com') ? 'Correct' : 'Check format - should end with .openai.azure.com') : 'Missing'
});

// Validate required environment variables
if (!azureEndpoint) {
  throw new Error('Azure OpenAI endpoint is missing. Please add VITE_AZURE_OPENAI_ENDPOINT to your environment variables');
}

if (!azureApiKey) {
  throw new Error('Azure OpenAI API key is missing. Please add VITE_AZURE_OPENAI_API_KEY to your environment variables');
}

class AIchatSession {
  static async sendMessage(prompt) {
    try {
      // Construct the Azure OpenAI API URL
      // Handle both base URLs and full URLs
      let apiUrl;
      if (azureEndpoint.includes('/chat/completions')) {
        // Full URL provided - use as is
        apiUrl = azureEndpoint;
        console.log('🔗 Using provided full URL');
      } else {
        // Base URL provided - construct full URL
        apiUrl = `${azureEndpoint}/openai/deployments/${azureDeploymentName}/chat/completions?api-version=${azureApiVersion}`;
        console.log('🔗 Constructed URL from base endpoint');
      }
      
      console.log('Making request to Azure OpenAI...');
      console.log('🔗 Full API URL (for debugging):', apiUrl);
      console.log('📋 Request details:', {
        endpoint: azureEndpoint,
        deployment: azureDeploymentName,
        apiVersion: azureApiVersion,
        hasApiKey: !!azureApiKey,
        isFullUrl: azureEndpoint.includes('/chat/completions')
      });

      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are a professional resume expert specializing in LaTeX document generation. When given a template name and resume data, generate complete, compilable LaTeX code that matches the specified template style.\n\nTemplate Styles:\n- Jake: Modern tech resume with clean sections, professional styling, and ATS-friendly format\n- Harvard: Academic-focused, education-first, conservative black and white styling\n- Modern Professional: Contemporary design with bold headers and clean lines\n- Minimalist: Maximum white space, simple dividers, content-focused\n- Standard: Traditional business format, widely accepted\n\nAlways return only the complete LaTeX document from \\documentclass to \\end{document}. Ensure proper LaTeX syntax, escape special characters correctly, and create professional formatting appropriate for the specified template."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 8192,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Azure OpenAI API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        if (response.status === 401) {
          throw new Error('Invalid Azure OpenAI API key. Please check your VITE_AZURE_OPENAI_API_KEY environment variable');
        }
        
        if (response.status === 404) {
          throw new Error('Azure OpenAI endpoint or deployment not found. Please check your VITE_AZURE_OPENAI_ENDPOINT and VITE_AZURE_OPENAI_DEPLOYMENT_NAME');
        }

        if (response.status === 429) {
          throw new Error('Azure OpenAI rate limit exceeded. Please try again in a few moments');
        }

        throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const text = data.choices[0].message.content;
        console.log('✅ Successfully received response from Azure OpenAI GPT-4o');
        return {
          response: {
            text: () => text
          }
        };
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format from Azure OpenAI');
      }

    } catch (error) {
      console.error('Azure OpenAI API Error:', {
        message: error.message,
        stack: error.stack
      });

      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Azure OpenAI. Please check your internet connection and endpoint URL');
      }

      // Re-throw with context
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

export { AIchatSession }; 