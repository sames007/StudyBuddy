# StudyBuddy AI: Your AI-Powered Learning Partner

StudyBuddy AI is a modern web application built with Next.js and Firebase, designed to be an intelligent, all-in-one study assistant. It leverages the power of Google's Gemini AI through Genkit to provide students with a suite of powerful tools to enhance their learning process, from understanding complex topics to preparing for exams. It also integrates with the Open Library API for powerful book searching capabilities.

## Features

StudyBuddy is packed with features designed to make studying more effective and engaging.

### Interactive Learning Tools
- **Conversational AI Tutor**: Engage in a continuous dialogue with your AI tutor. Ask follow-up questions and explore topics in-depth, just like a real conversation.
- **Note Summarizer**: Paste your notes or upload a text file (`.txt`, `.md`) to get a concise summary of the key points.
- **Dynamic Flashcards**: Automatically generate a set of flashcards for any topic to test your knowledge.
- **Smart Quiz Engine**: Create quizzes with a mix of multiple-choice and true/false questions, complete with instant feedback and answer explanations.
- **Book Search**: Find information on millions of books using the integrated Open Library Search API.

### Personalized Experience
- **Study History**: All your interactions are automatically saved, allowing you to revisit past conversations, summaries, flashcards, and quizzes.
- **Secure Authentication**: User accounts are securely managed with Firebase Authentication, supporting both email/password and Google Sign-In.
- **Sleek, Responsive UI**: A modern, theme-aware interface built with ShadCN UI and Tailwind CSS that supports both light and dark modes, ensuring a great experience on any device.

## Tech Stack

This project is built on a modern, robust, and scalable technology stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) for storing user history.
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **External APIs**: [Open Library Search API](https://openlibrary.org/developers/api) for book data.
- **Deployment**: Configured for [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- A Firebase project. You can create one for free at the [Firebase Console](https://console.firebase.google.com/).

### Local Configuration

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    ```

2.  **Create an Environment File:**
    Create a file named `.env` in the root of your project. This file will hold your API key for the AI features.

3.  **Add your Genkit API Key:**
    You will need an API key to use Google's Gemini models via Genkit. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey). Add it to your `.env` file like this:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Firebase Configuration:**
    The Firebase project configuration is already included in `src/lib/firebase.ts`. The app is connected to a default Firebase project, but for a production application, you should replace it with your own project's configuration in that file.

### Installation & Running Locally

1.  **Install NPM packages:**
    ```sh
    npm install
    ```

2.  **Run the development server:**
    ```sh
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the main page by modifying `src/app/page.tsx`.

## Deployment to Firebase App Hosting

This application is configured for deployment using [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

### 1. Install Firebase CLI
If you don't have it installed, install the Firebase command-line tools globally:
```sh
npm install -g firebase-tools
```

### 2. Log in to Firebase
```sh
firebase login
```
    
### 3. Initialize Firebase in Your Project (One-Time Step)
If you haven't deployed this project before, you need to link your local directory to your Firebase project. This is a one-time step.
```sh
firebase init apphosting
```
Follow the on-screen prompts to select your Firebase project and configure the App Hosting backend.

**Note on Billing**: Firebase App Hosting requires your project to be on the "Blaze" (pay-as-you-go) billing plan. You will be prompted to upgrade if you are on the free "Spark" plan. The Blaze plan includes a generous free tier, so you will likely not incur any costs for a personal project.

### 4. Deploy the App & Set Secrets
To deploy your app, you first need to set your `GEMINI_API_KEY` as a secret in Google Secret Manager and grant your App Hosting backend access to it.

**The `apphosting.yaml` file is configured to require this secret. Your deployment will fail until this step is completed.**

**Run the following command to set the secret:**

```sh
firebase apphosting:secrets:set GEMINI_API_KEY
```

When prompted, paste in your API key value from your `.env` file. This command securely stores your key in Google Secret Manager and makes it available to your app.

**After setting the secret, deploy your app:**

```sh
firebase deploy
```
    
Once the deployment is complete, the CLI will output the URL to your live site.

## Making and Deploying Changes

Once your site is live, you can continue to update it. The workflow is simple:

1.  **Make Changes Locally**: Edit your code to add features, fix bugs, or change the UI.
2.  **Test Locally**: Run `npm run dev` to test your changes on your local machine.
3.  **Deploy the Updates**: When you are ready to publish your changes, run the deploy command again:
    ```sh
    firebase deploy
    ```
    
This will build the new version of your app and update your live deployment. You do not need to set the API key secret again unless you change it or add new ones.
