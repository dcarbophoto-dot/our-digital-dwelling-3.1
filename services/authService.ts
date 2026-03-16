import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  type User
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureUserProfile } from "./dbService";

const googleProvider = new GoogleAuthProvider();

/**
 * Handles Google authentication and ensures a user profile exists in Firestore.
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync with Firestore profile
    await ensureUserProfile(result.user.uid, result.user.email, result.user.displayName);
    return result.user;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Standard email/password login.
 */
export const login = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    // Ensure profile exists (for existing users who don't have a doc yet)
    await ensureUserProfile(userCredential.user.uid, userCredential.user.email, userCredential.user.displayName);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      throw new Error("Password or Email Incorrect");
    }
    throw error;
  }
};

/**
 * Account registration with email verification flow.
 */
export const register = async (email: string, pass: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    // Create Firestore profile immediately
    await ensureUserProfile(userCredential.user.uid, userCredential.user.email, null);
    // Send verification email
    await sendEmailVerification(userCredential.user);
    // Sign out immediately so they aren't logged in unverified
    await signOut(auth);
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Triggers a new verification email for unverified accounts.
 */
export const resendVerificationEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user);
    }
    await signOut(auth);
    return true;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Password reset request.
 */
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error("No account found with this email address.");
    }
    throw error;
  }
};

/**
 * Deletes the currently authenticated user's account.
 */
export const deleteUserAccount = async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteUser(user);
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Please re-authenticate to delete your account.");
    }
    throw error;
  }
};

/**
 * Signs out the current user.
 */
export const logout = () => {
  return signOut(auth);
};

/**
 * Observer for auth state changes.
 */
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};