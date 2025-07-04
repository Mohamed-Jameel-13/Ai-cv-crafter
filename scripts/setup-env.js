#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  console.log("🚀 AI Resume Crafter - Environment Setup");
  console.log("=====================================\n");

  console.log(
    "This script will help you set up your environment variables for Azure OpenAI.\n",
  );

  // Check if .env.local already exists
  const envPath = path.join(path.dirname(__dirname), ".env.local");
  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env.local file already exists!");
    const overwrite = await askQuestion("Do you want to overwrite it? (y/N): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("❌ Setup cancelled.");
      rl.close();
      return;
    }
  }

  console.log("\n📋 Please provide the following information:\n");

  // Azure OpenAI Configuration
  console.log("🔵 Azure OpenAI Configuration:");
  const azureEndpoint = await askQuestion(
    "Enter your Azure OpenAI endpoint URL: ",
  );
  const azureApiKey = await askQuestion("Enter your Azure OpenAI API key: ");
  const azureApiVersion =
    (await askQuestion(
      "Enter API version (press Enter for default 2024-02-15-preview): ",
    )) || "2024-02-15-preview";
  const azureDeploymentName =
    (await askQuestion(
      'Enter deployment name (press Enter for default "gpt-4o"): ',
    )) || "gpt-4o";

  console.log("\n🔥 Firebase Configuration:");
  const firebaseApiKey = await askQuestion("Enter Firebase API key: ");
  const firebaseAuthDomain = await askQuestion("Enter Firebase Auth Domain: ");
  const firebaseProjectId = await askQuestion("Enter Firebase Project ID: ");
  const firebaseStorageBucket = await askQuestion(
    "Enter Firebase Storage Bucket: ",
  );
  const firebaseMessagingSenderId = await askQuestion(
    "Enter Firebase Messaging Sender ID: ",
  );
  const firebaseAppId = await askQuestion("Enter Firebase App ID: ");

  console.log("\n👤 Authentication Configuration:");
  const clerkKey = await askQuestion(
    "Enter Clerk Publishable Key (optional): ",
  );

  // Create .env.local content
  const envContent = `# Azure OpenAI Configuration
VITE_AZURE_OPENAI_ENDPOINT=${azureEndpoint}
VITE_AZURE_OPENAI_API_KEY=${azureApiKey}
VITE_AZURE_OPENAI_API_VERSION=${azureApiVersion}
VITE_AZURE_OPENAI_DEPLOYMENT_NAME=${azureDeploymentName}

# Firebase Configuration
VITE_FIREBASE_API_KEY=${firebaseApiKey}
VITE_FIREBASE_AUTH_DOMAIN=${firebaseAuthDomain}
VITE_FIREBASE_PROJECT_ID=${firebaseProjectId}
VITE_FIREBASE_STORAGE_BUCKET=${firebaseStorageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseMessagingSenderId}
VITE_FIREBASE_APP_ID=${firebaseAppId}

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=${clerkKey}

# Generated on ${new Date().toISOString()}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Environment configuration saved to .env.local");
    console.log("\n📌 Next steps:");
    console.log("1. Review the .env.local file");
    console.log('2. Run "npm run dev" to start development server');
    console.log("3. Test the Azure OpenAI integration");
    console.log("4. For deployment, refer to DEPLOYMENT_GUIDE.md");
    console.log("\n⚠️  Remember: Never commit .env.local to version control!");
  } catch (error) {
    console.error("❌ Error creating .env.local file:", error.message);
  }

  rl.close();
}

// Run the setup
setupEnvironment().catch((error) => {
  console.error("❌ Setup failed:", error.message);
  rl.close();
});
