# StudyBuddy

StudyBuddy is a Next.js and Firebase study assistant with AI tutoring, note summaries, flashcards, quizzes, book search, authentication, profile pictures, and saved study history.

## Features

- AI Tutor: ask follow-up questions and continue saved tutor conversations.
- Note Summarizer: paste notes or upload `.txt` / `.md` files for concise summaries.
- Flashcard Generator: create study cards from any topic.
- Quiz Generator: create and take multiple-choice or true/false quizzes.
- Book Search: search Open Library for books and cover images.
- Study History: save, view, continue, and delete previous study activity.
- Profile: update display name and upload an avatar.

## Stack

- Next.js App Router
- React and Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Gemini API through the official REST endpoint
- Firebase App Hosting

## Firebase Resources To Recreate

Use Firebase project `studybuddy-4f855` / project number `32468092136`.

1. Web app
   - Use the `StudyBuddy-web` app config from `.env.example`.
   - The checked-in fallback config uses app ID `1:32468092136:web:aa3fb06cf7b4094e30755d`.

2. Authentication
   - Enable Email/Password.
   - Enable Google sign-in.
   - Add your deployed domain and local domains to Firebase Auth authorized domains.

3. Cloud Firestore
   - Create a Firestore database.
   - Deploy `firestore.rules`.
   - Deploy `firestore.indexes.json` for the history query on `studies`.

4. Firebase Storage
   - Create the default bucket `studybuddy-4f855.firebasestorage.app`.
   - Deploy `storage.rules` for avatar uploads.

5. Gemini API
   - Create a Google AI Studio API key.
   - Store it locally as `GEMINI_API_KEY`.
   - Store it in Firebase App Hosting as the `GEMINI_API_KEY` secret.
   - Optional: set `GEMINI_MODEL`; the default is `gemini-3.5-flash`.

6. Firebase App Hosting
   - Create the backend `studybuddy-backend` in `us-central1`.
   - App Hosting requires the Blaze plan.

Analytics is optional. The config keeps the measurement ID, but the app does not initialize Analytics.

## Local Setup

```sh
npm ci
```

Create `.env.local` from `.env.example`, then set your real Gemini API key:

```sh
GEMINI_API_KEY=your_google_ai_studio_key
```

Run the app:

```sh
npm run dev
```

Open [http://localhost:9002](http://localhost:9002).

## Checks

```sh
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Deploy

```sh
firebase login
firebase use studybuddy-4f855
firebase apphosting:secrets:set GEMINI_API_KEY
firebase deploy
```
