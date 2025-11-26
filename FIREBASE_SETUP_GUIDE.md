# Firebase Integration Guide

## Overview
Your Grocery List App now uses **Firebase Authentication** for real user registration and login instead of mock authentication. This guide explains what changed and how the Firebase integration works.

## What is Firebase?
Firebase is Google's backend-as-a-service platform that provides:
- **Authentication**: Manage user accounts and login
- **Cloud Firestore**: Store data in the cloud
- **Real-time Database**: Sync data across devices in real-time

We're currently using Firebase Authentication. Database integration (Firestore) comes in the next phase.

---

## Setup Completed

### 1. Firebase Config File Created
**File**: `src/config/firebaseConfig.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBCMF9ETi3R0UijOfqIQ_n6zJOAVJ_Rp3c",
  authDomain: "grocerylistapp-79849.firebaseapp.com",
  projectId: "grocerylistapp-79849",
  storageBucket: "grocerylistapp-79849.firebasestorage.app",
  messagingSenderId: "936341780359",
  appId: "1:936341780359:web:310c555cca4295aa7ec522"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

**What it does**:
- Initializes Firebase with your project credentials
- Creates and exports `auth` object (your connection to Firebase Authentication)
- This is used throughout your app to authenticate users

### 2. AuthContext Updated
**File**: `src/context/AuthContext.tsx`

**Key Changes**:
- Added `register()` function for new user sign-ups
- Updated `login()` to accept both email AND password
- Updated `logout()` to be async (returns a Promise)
- Added `useEffect()` hook with `onAuthStateChanged()` listener

**How it works**:
```typescript
// This listener watches Firebase for authentication changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User logged in
      setIsLoggedIn(true);
      setUserEmail(user.email);
    } else {
      // User logged out
      setIsLoggedIn(false);
      setUserEmail(null);
    }
  });
  return unsubscribe;
}, []);
```

This means:
- When user logs in, Firebase notifies us and we update state
- When user logs out, Firebase notifies us and we clear state
- The root layout automatically shows/hides login screen based on this state

### 3. LoginScreen Updated
**File**: `src/screens/auth/LoginScreen.tsx`

**Changes**:
- `handleLogin()` now calls `login(email, password)` with both credentials
- Made `handleLogin()` async to wait for Firebase response
- Added try/catch to handle authentication errors
- Shows user-friendly error messages for failed logins

**Example flow**:
```typescript
const handleLogin = async () => {
  try {
    await login(email, password); // Calls Firebase
    // If successful, onAuthStateChanged fires and updates state
    // Root layout sees isLoggedIn=true and shows HomeScreen
  } catch (error) {
    Alert.alert('Login Error', error.message);
  }
};
```

### 4. RegisterScreen Updated
**File**: `src/screens/auth/RegisterScreen.tsx`

**Changes**:
- Now calls `register(email, password)` instead of `login()`
- Made `handleRegister()` async
- Added try/catch for error handling
- Displays success message after account creation

**Example flow**:
```typescript
const handleRegister = async () => {
  try {
    await register(email, password); // Creates new user in Firebase
    // Firebase automatically logs them in
    // onAuthStateChanged fires and updates state
    // Root layout shows HomeScreen
  } catch (error) {
    Alert.alert('Registration Error', error.message);
  }
};
```

### 5. HomeScreen Updated
**File**: `src/screens/HomeScreen.tsx`

**Changes**:
- `handleLogout()` now awaits the async `logout()` function
- Added try/catch for logout errors
- Removed manual router.replace() - navigation happens automatically

**Why automatic?**:
- When `logout()` is called, Firebase clears the current user
- `onAuthStateChanged()` listener in AuthContext fires
- AuthContext state updates to `isLoggedIn=false`
- Root layout sees this change and shows LoginScreen
- No manual navigation needed!

---

## How Firebase Authentication Works (Simplified)

### Registration Flow:
```
User fills form and presses Register
  ↓
handleRegister() calls register(email, password)
  ↓
Firebase creates new user account with email/password
  ↓
Firebase automatically logs them in
  ↓
onAuthStateChanged() listener fires in AuthContext
  ↓
AuthContext updates: isLoggedIn=true, userEmail="user@example.com"
  ↓
Root layout sees isLoggedIn=true
  ↓
Root layout shows HomeScreen instead of LoginScreen
```

### Login Flow:
```
User fills form and presses Login
  ↓
handleLogin() calls login(email, password)
  ↓
Firebase verifies email/password match existing account
  ↓
If match: Firebase logs them in, returns user object
If no match: Firebase throws error (user sees "Wrong password" or "User not found")
  ↓
If successful, onAuthStateChanged() fires in AuthContext
  ↓
Same as above: AuthContext updates state → Root layout shows HomeScreen
```

### Logout Flow:
```
User presses Logout button
  ↓
handleLogout() calls logout()
  ↓
Firebase clears current user session
  ↓
onAuthStateChanged() listener fires in AuthContext
  ↓
AuthContext updates: isLoggedIn=false, userEmail=null
  ↓
Root layout sees isLoggedIn=false
  ↓
Root layout shows LoginScreen
```

---

## Key Concepts Explained

### Promises & Async/Await
Firebase functions return **Promises** - they take time to complete:

```typescript
// Without await - doesn't wait for result
const handleLogin = () => {
  login(email, password); // Returns immediately, may not have result yet
  router.push('./home'); // Runs before login finishes!
};

// With await - waits for result
const handleLogin = async () => {
  await login(email, password); // Waits for Firebase response
  // Now we know if login succeeded or failed
  if (success) router.push('./home');
};
```

### onAuthStateChanged()
This is Firebase's way of telling us when authentication status changes:

```typescript
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.email);
  } else {
    console.log('User logged out');
  }
});
```

It fires when:
- User logs in (login succeeded)
- User logs out (logout called)
- App restarts (Firebase remembers previous session)
- User's session expires

---

## Testing the Integration

### Register a New Account:
1. Launch app (`npx expo start -c`)
2. Press the "Sign Up" link
3. Fill in name, email, password, confirm password
4. Press Register
5. Should see "Account created! You are now logged in."
6. Should be on HomeScreen

### Login:
1. Press Logout on HomeScreen
2. Press "Already have an account? Login"
3. Enter email/password from account you just created
4. Press Login
5. Should appear on HomeScreen

### Logout:
1. Press the Logout button in HomeScreen header
2. Should return to LoginScreen
3. Should NOT be able to access HomeScreen without logging in again

### Try Invalid Credentials:
1. Try logging in with wrong password
2. Should see error: "Firebase: Error (auth/wrong-password)"
3. Try logging in with non-existent email
4. Should see error: "Firebase: Error (auth/user-not-found)"

---

## Error Types You Might See

| Error | Meaning | Solution |
|-------|---------|----------|
| `auth/user-not-found` | Email doesn't have an account | Create account first (Register) |
| `auth/wrong-password` | Password is incorrect | Check spelling or use password reset |
| `auth/email-already-in-use` | Email already registered | Use different email or Login instead |
| `auth/invalid-email` | Email format is wrong | Use valid email format |
| `auth/weak-password` | Password too short | Use 6+ characters |

---

## What's Next?

### Phase 2: Firestore Database Integration
- Store grocery items in cloud database (not just in app memory)
- Items persist across app restarts
- Can sync across multiple devices

### Phase 3: Real-time Features
- See other users' lists (if you build multi-user feature)
- Real-time updates when items change
- Collaborative grocery shopping

---

## File Structure
```
src/
├── config/
│   └── firebaseConfig.ts          ← Firebase initialization
├── context/
│   └── AuthContext.tsx             ← Authentication logic
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx         ← Login UI with Firebase
│   │   └── RegisterScreen.tsx      ← Registration UI with Firebase
│   └── HomeScreen.tsx              ← Main app screen
app/
├── _layout.tsx                     ← Root layout (checks isLoggedIn)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (home)/
    ├── _layout.tsx
    └── index.tsx
```

---

## Troubleshooting

**Q: I created an account but can't log back in with same email**
- Make sure you're using exact same email and password
- Firebase is case-sensitive for emails
- Check for typos (spaces before/after email)

**Q: Changes aren't appearing on other device**
- This phase uses local authentication only
- Database (Firestore) integration is Phase 2 for multi-device sync

**Q: Getting "Firebase: Error (auth/network-request-failed)"**
- Check internet connection
- Firebase servers might be down (rare)
- Try again in a few moments

---

## Summary

✅ Firebase Authentication is now integrated
✅ Real user accounts created in Firebase
✅ Real login/logout with Firebase
✅ Automatic state management with listeners
✅ Proper error handling throughout

Your app now has production-ready authentication! 🎉
