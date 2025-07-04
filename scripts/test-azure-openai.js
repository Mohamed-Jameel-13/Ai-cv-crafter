#!/usr/bin/env node

// Load environment variables from .env.local
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Node.js 18+ has fetch built-in

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = path.join(path.dirname(__dirname), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const envVars = {};

    envContent.split("\n").forEach((line) => {
      if (line.trim() && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join("=").trim();
        }
      }
    });

    return envVars;
  }
  return {};
}

async function testAzureOpenAI() {
  console.log("🧪 Azure OpenAI Configuration Test");
  console.log("===================================\n");

  // Load environment variables
  const envVars = loadEnvFile();

  const azureEndpoint = envVars.VITE_AZURE_OPENAI_ENDPOINT;
  const azureApiKey = envVars.VITE_AZURE_OPENAI_API_KEY;
  const azureApiVersion =
    envVars.VITE_AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
  const azureDeploymentName =
    envVars.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4o";

  console.log("📋 Configuration Check:");
  console.log("─────────────────────────");
  console.log(`✓ Endpoint: ${azureEndpoint ? "✅ Set" : "❌ Missing"}`);
  console.log(`✓ API Key: ${azureApiKey ? "✅ Set" : "❌ Missing"}`);
  console.log(`✓ API Version: ${azureApiVersion}`);
  console.log(`✓ Deployment Name: ${azureDeploymentName}`);

  if (azureEndpoint) {
    const isValidFormat =
      azureEndpoint.includes(".openai.azure.com") ||
      azureEndpoint.includes(".cognitiveservices.azure.com");
    console.log(
      `✓ Endpoint Format: ${isValidFormat ? "✅ Correct" : "❌ Should end with .openai.azure.com or .cognitiveservices.azure.com"}`,
    );
    console.log(
      `✓ Endpoint Protocol: ${azureEndpoint.startsWith("https://") ? "✅ HTTPS" : "❌ Should start with https://"}`,
    );
    console.log(
      `✓ URL Type: ${azureEndpoint.includes("/chat/completions") ? "🔗 Full URL" : "🏠 Base URL"}`,
    );
  }

  console.log("");

  // Check if required variables are present
  if (!azureEndpoint || !azureApiKey) {
    console.log("❌ Missing required environment variables!");
    console.log("Please run: npm run setup");
    return;
  }

  // Validate endpoint format
  const isValidEndpoint =
    azureEndpoint.includes(".openai.azure.com") ||
    azureEndpoint.includes(".cognitiveservices.azure.com");
  if (!isValidEndpoint) {
    console.log("❌ Invalid endpoint format!");
    console.log("Expected formats:");
    console.log("  - https://your-resource-name.openai.azure.com");
    console.log("  - https://your-resource-name.cognitiveservices.azure.com");
    console.log(`Your endpoint: ${azureEndpoint}`);
    return;
  }

  // Test API connection
  console.log("🔄 Testing API Connection...");
  console.log("─────────────────────────────");

  // Handle both base URLs and full URLs
  let apiUrl;
  if (azureEndpoint.includes("/chat/completions")) {
    // Full URL provided - use as is
    apiUrl = azureEndpoint;
    console.log("🔗 Using provided full URL");
  } else {
    // Base URL provided - construct full URL
    apiUrl = `${azureEndpoint}/openai/deployments/${azureDeploymentName}/chat/completions?api-version=${azureApiVersion}`;
    console.log("🔗 Constructed URL from base endpoint");
  }

  console.log(`🔗 Testing URL: ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": azureApiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content:
              "Hello, this is a test message. Please respond with 'Connection successful!'",
          },
        ],
        max_tokens: 50,
      }),
    });

    console.log(
      `📡 Response Status: ${response.status} ${response.statusText}`,
    );

    if (response.ok) {
      console.log("✅ SUCCESS: Azure OpenAI connection working!");
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        console.log("📝 Test Response:", data.choices[0].message.content);
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log("❌ ERROR Details:");
      console.log("────────────────");

      if (response.status === 401) {
        console.log("🔑 Authentication Error:");
        console.log("   - Check if your API key is correct");
        console.log("   - Verify the API key is not expired");
        console.log("   - Make sure you copied the key correctly");
      } else if (response.status === 404) {
        console.log("🔍 Resource Not Found:");
        console.log("   - Check if your endpoint URL is correct");
        console.log(
          "   - Verify the deployment name exists in Azure OpenAI Studio",
        );
        console.log('   - Make sure the deployment is in "Succeeded" state');
        console.log("   - Check if the API version is supported");
        console.log("");
        console.log("🛠️  Troubleshooting Steps:");
        console.log("   1. Go to Azure OpenAI Studio (https://oai.azure.com)");
        console.log("   2. Select your resource");
        console.log('   3. Go to "Deployments" tab');
        console.log("   4. Verify deployment exists and note the exact name");
        console.log('   5. Check deployment status is "Succeeded"');
      } else if (response.status === 429) {
        console.log("⏱️  Rate Limit Exceeded:");
        console.log("   - Wait a few minutes and try again");
        console.log("   - Check your quota in Azure portal");
      } else {
        console.log("❓ Other Error:");
        console.log(`   Status: ${response.status}`);
        console.log(
          `   Message: ${errorData.error?.message || "Unknown error"}`,
        );
      }
    }
  } catch (networkError) {
    console.log("❌ NETWORK ERROR:");
    console.log("─────────────────");
    console.log(`Error: ${networkError.message}`);
    console.log("");
    console.log("🛠️  Possible Issues:");
    console.log("   - Internet connection problems");
    console.log("   - Firewall blocking the request");
    console.log("   - Invalid endpoint URL format");
    console.log("   - DNS resolution issues");
  }

  console.log("");
  console.log("📚 Additional Resources:");
  console.log("─────────────────────────");
  console.log("• Azure OpenAI Studio: https://oai.azure.com");
  console.log("• Azure Portal: https://portal.azure.com");
  console.log(
    "• Documentation: https://docs.microsoft.com/en-us/azure/cognitive-services/openai/",
  );
  console.log("");
  console.log(
    "💡 Need help? Check DEPLOYMENT_GUIDE.md for detailed setup instructions.",
  );
}

// Run the test
testAzureOpenAI().catch((error) => {
  console.error("Test failed:", error.message);
});
