# Firebase Authentication Setup Guide

## Current Error: `auth/admin-restricted-operation`

This error means your Firebase Console has authentication restrictions enabled.

---

## ✅ Solution: Allow Public Sign-ups

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com)
2. Select your project: **lifeos-3539c**
3. Go to **Authentication** (left sidebar)

### Step 2: Enable Authentication Methods

#### Option A: Email/Password
1. Click **Sign-in method** tab
2. Find **Email/Password** → Click it
3. Enable both:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in)
4. Click **Save**

#### Option B: Google
1. In **Sign-in method** tab
2. Find **Google** → Click it
3. Enable it
4. Add your email as a test user (you should be able to sign in)
5. Click **Save**

### Step 3: Remove Admin Restrictions

If you still get the error, check **Firestore Rules**:

1. Go to **Firestore Database** (left sidebar)
2. Click **Rules** tab
3. Replace with this:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

4. Click **Publish**

### Step 4: Check Quotas
1. Go to **Authentication** → **Quotas**
2. Ensure you haven't exceeded limits
3. Check **Settings** → **Authorized domains**
4. Verify `localhost`, `127.0.0.1`, and your Vercel domain are listed

---

## ✅ After Setup

Once configured:
1. Visit your app (or refresh if open)
2. You should see the Login page with:
   - ✅ Google Sign-In button
   - ✅ Email Sign-In button
   - ✅ Create Account button
3. Test by creating an account or signing in
4. Data will sync automatically to Firebase

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `auth/admin-restricted-operation` | Enable authentication in Firebase Console |
| `auth/email-already-in-use` | Email exists → Use sign-in instead |
| `auth/weak-password` | Use password with 6+ characters |
| `auth/network-request-failed` | Check internet connection |

---

## Features Now Working

✅ Email/Password Sign-Up  
✅ Email/Password Sign-In  
✅ Google OAuth Sign-In  
✅ Remember Me (stores email)  
✅ Auto-fill on return visits  
✅ Persistent login across page reloads  
✅ Real-time Firebase Sync  
✅ Sign-out functionality  
✅ Error messages with solutions  
