# Million Dollar Secret

A daily hidden mission game inspired by the TV show..

## URLs
- **Live:** `https://JackRM95.github.io/million-dollar-secret/`
- **Staging:** `https://JackRM95.github.io/million-dollar-secret/staging/`

## Branches
| Branch | Purpose | Deploys to |
|--------|---------|------------|
| `main` | Production code | Live URL |
| `staging` | Testing | Staging URL |

## Setup

### 1. Firebase
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project called `million-dollar-secret`
3. Add a **Web app** — copy the config values
4. Go to **Firestore Database** → Create database → Start in **test mode**
5. Add these Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /game/{doc} {
      allow read, write: if true;
    }
  }
}
```

### 2. GitHub Secrets
In your repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|-------------|-------|
| `FIREBASE_API_KEY` | from Firebase config |
| `FIREBASE_AUTH_DOMAIN` | from Firebase config |
| `FIREBASE_PROJECT_ID` | from Firebase config |
| `FIREBASE_STORAGE_BUCKET` | from Firebase config |
| `FIREBASE_MESSAGING_SENDER_ID` | from Firebase config |
| `FIREBASE_APP_ID` | from Firebase config |

### 3. GitHub Pages
Repo → Settings → Pages → Source: **Deploy from a branch** → Branch: `gh-pages` → `/ (root)`

### 4. Local development
```bash
cp .env.example .env.local
# fill in your Firebase values in .env.local
npm install
npm run dev
```

## Deployment workflow
1. All changes go to `staging` branch first → auto-deploys to staging URL
2. Test on staging
3. Merge `staging` → `main` (via PR) → auto-deploys to live URL

## Back office access
Tap the "Million Dollar Secret" title **5 times** to open the back office. Password: set in `src/App.jsx` as `BO_PASSWORD`.
