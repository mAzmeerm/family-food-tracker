import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    let message = 'Failed to sign in. Please check your credentials.';
    if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
      message = 'Invalid email or password.';
    } else if (authError.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (authError.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please try again later.';
    } else if (authError.code === 'auth/operation-not-allowed') {
      message = 'Email/Password authentication is not enabled in Firebase Console. You can use Google Sign-In below.';
    } else if (authError.message) {
      message = authError.message;
    }
    throw new Error(message);
  }
};

export const createFamilyAccount = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    let message = 'Failed to create family account.';
    if (authError.code === 'auth/email-already-in-use') {
      message = 'This email is already in use. Please switch to "Sign In" instead.';
    } else if (authError.code === 'auth/weak-password') {
      message = 'Password must be at least 6 characters.';
    } else if (authError.code === 'auth/invalid-email') {
      message = 'Please enter a valid email address.';
    } else if (authError.code === 'auth/operation-not-allowed') {
      message = 'Email/Password registration is not enabled in Firebase Console. Please use Google Sign-In below.';
    } else if (authError.message) {
      message = authError.message;
    }
    throw new Error(message);
  }
};

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code === 'auth/popup-closed-by-user') {
      throw new Error('Google sign-in popup was closed.');
    } else if (authError.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by browser. Please allow popups.');
    }
    throw new Error(authError.message || 'Failed to sign in with Google.');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
