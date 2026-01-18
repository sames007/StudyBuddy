# StudyBuddy AI: Your AI-Powered Learning Partner

StudyBuddy AI is a modern web application built with Next.js and Firebase, designed to be an intelligent, all-in-one study assistant. It leverages the power of Google's Gemini AI through Genkit to provide students with a suite of powerful tools to enhance their learning process, from understanding complex topics to preparing for exams.

## Features

StudyBuddy is packed with features designed to make studying more effective and engaging.

### Interactive Learning Tools
- **Conversational AI Tutor**: Engage in a continuous dialogue with your AI tutor. Ask follow-up questions and explore topics in-depth, just like a real conversation.
- **Note Summarizer**: Paste your notes or upload a text file (`.txt`, `.md`) to get a concise summary of the key points.
- **Dynamic Flashcards**: Automatically generate a set of flashcards for any topic to test your knowledge.
- **Smart Quiz Engine**: Create quizzes with a mix of multiple-choice and true/false questions, complete with instant feedback and answer explanations.

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
    
### 3. Initialize Firebase in Your Project
This is a one-time step that links your local directory to your Firebase project and creates the necessary configuration files (`firebase.json` and `.firebaserc`).
```sh
firebase init apphosting
```
Follow the on-screen prompts to select your Firebase project and configure the App Hosting backend.

**Note on Billing**: Firebase App Hosting requires your project to be on the "Blaze" (pay-as-you-go) billing plan. You will be prompted to upgrade if you are on the free "Spark" plan. The Blaze plan includes a generous free tier, so you will likely not incur any costs for a personal project.

### 4. Deploy the App
In your project's root directory, run the following command to build and deploy your application:
```sh
firebase deploy
```
    
The deploy command will automatically build your Next.js application and deploy it to Firebase App Hosting. When prompted, enter your `GEMINI_API_KEY` as a secret. Once complete, the CLI will output the URL to your live site.

## Making and Deploying Changes

Once your site is live, you can continue to update it. The workflow is simple:

1.  **Make Changes Locally**: Edit your code to add features, fix bugs, or change the UI. You can ask me to make changes, or you can edit the files directly.
2.  **Test Locally**: Run `npm run dev` to test your changes on your local machine.
3.  **Deploy the Updates**: When you are ready to publish your changes to the live site, run the deploy command again:
    ```sh
    firebase deploy
    ```
    
This will build the new version of your app and update your live deployment. You do not need to run `firebase init` again.
