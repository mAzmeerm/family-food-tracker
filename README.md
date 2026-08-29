# Family Food Tracker 🍽️

React + Vite + Firebase web app for a private family food journal.

## What was fixed for a real Firebase project

The original AI Studio export depended on `firebase-applet-config.json`, which is specific to the AI Studio/Firebase environment that generated the app. This version:

- reads Firebase configuration from Vite environment variables
- removes the hardcoded AI Studio Firebase config
- ignores `.env` so local credentials/config are not committed
- supports the normal `(default)` Firestore database
- adds Firebase Hosting configuration for a Vite SPA
- keeps the existing Firestore rules and indexes

> Firebase Web API keys are not treated like server secrets, but your Firebase project must still be protected with Authentication and Firestore Security Rules. Never put service-account private keys in this frontend.

## 1. Install

```bash
npm install
```

## 2. Create your own Firebase project

Open the Firebase Console and create a new project.

Then:

1. **Build → Authentication → Get started**
2. Enable **Email/Password**.
3. Optionally enable **Google**.
4. **Build → Firestore Database → Create database**.
5. Use the **default database** unless you have a reason to create a named database.

## 3. Register the web app

In Firebase Console:

**Project settings → General → Your apps → Web (`</>`)**

Register the app and copy the Firebase config values.

Create `.env` in the project root:

```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

You can start from `.env.example`.

## 4. Create the family login account

For a private family journal, the safest simple setup is to create the account yourself:

**Firebase Console → Authentication → Users → Add user**

Create the family email/password there.

The app also contains registration code, but for a real private deployment you should not expose public registration unless you deliberately want other people to create accounts.

## 5. Run locally

```bash
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://localhost:3000
```

Sign in using the Firebase user you created.

## 6. Deploy Firestore rules

Install Firebase CLI once:

```bash
npm install -g firebase-tools
```

Login:

```bash
firebase login
```

Connect this folder to your Firebase project:

```bash
firebase use --add
```

Choose your project.

Deploy rules and indexes:

```bash
firebase deploy --only firestore
```

## 7. Deploy the website

Build first:

```bash
npm run build
```

Then:

```bash
firebase deploy --only hosting
```

Firebase will give you a live URL.

### Important: add your production domain

After deploying, go to:

**Firebase Console → Authentication → Settings → Authorized domains**

Make sure your Firebase Hosting domain is listed. If you later use a custom domain, add that too.

## 8. Firestore data structure

The app uses these collections:

### `restaurants/{restaurantId}`

- `name`: string
- `latitude`: number
- `longitude`: number
- `address`: string | null
- `imageUrl`: string | null
- `createdAt`: timestamp
- `updatedAt`: timestamp

### `reviews/{reviewId}`

- `restaurantId`: string
- `memberId`: string
- `memberName`: string
- `rating`: number from 1–5
- `feedback`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp

### `family_members/{memberId}`

- `name`: string
- `createdAt`: timestamp

The app automatically creates the default family members if the collection is empty.

## 9. How the Firebase connection actually works

Think of the setup like this:

```text
Your React app
     │
     │ Firebase Web SDK
     ▼
Firebase Authentication ──→ checks who is logged in
     │
     ▼
Cloud Firestore ──────────→ restaurants / reviews / family_members
     │
     ▼
Firestore Security Rules ─→ decides what authenticated users can do
```

The frontend does **not** directly connect to your database with a password.

It uses Firebase's Web SDK:

```ts
initializeApp(firebaseConfig)
getAuth(app)
getFirestore(app)
```

The `.env` values identify your Firebase web app. Authentication gives the browser a signed-in user session, and Firestore Security Rules decide whether that user can read/write data.

## 10. If you get common errors

### `Missing Firebase environment variables`

Check that `.env` exists in the project root and that every `VITE_FIREBASE_*` value is filled in.

Restart Vite after changing `.env`.

### `FirebaseError: Missing or insufficient permissions`

Usually means:

- user is not signed in, or
- Firestore rules were not deployed to the correct project.

Run:

```bash
firebase use
firebase deploy --only firestore:rules
```

### Google sign-in does not work

Check:

**Firebase Console → Authentication → Sign-in method → Google**

Also check:

**Authentication → Settings → Authorized domains**

### App works locally but not after deployment

Make sure the same Firebase `.env` values are available during the production build. For Firebase Hosting, the easiest approach is to build locally after creating the correct `.env`, then deploy the resulting `dist` folder.

## 11. Recommended production workflow

Do not keep editing the live app directly.

Use:

```text
Google AI Studio
      ↓
download/export code
      ↓
VS Code
      ↓
.env
      ↓
Firebase project
      ↓
npm run build
      ↓
firebase deploy
```

Use AI Studio for vibe-coding and rapid changes, but treat the downloaded project as the real source code that you test, version-control, and deploy.

## Features

- Firebase Authentication
- Family member review system
- Restaurant CRUD
- Browser GPS location
- Leaflet / OpenStreetMap map
- 1–5 star ratings
- Individual reviews
- Google Maps links
- Food map
- Search and sorting
- Firestore security rules
