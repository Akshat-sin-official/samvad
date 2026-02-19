import { ReactNode, useEffect, useState, useCallback, useContext, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check if user is returning from redirect
    getRedirectResult(auth)
      .then((result) => {
        if (result && isMounted) {
          // User successfully signed in via redirect
          // onAuthStateChanged will update the user state
          console.log('User signed in via redirect:', result.user.email);
        }
      })
      .catch((error) => {
        if (isMounted) {
          // Only log non-cancellation errors
          if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
            console.error('Redirect result error:', error);
          }
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (isMounted) {
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes if needed
      provider.addScope('profile');
      provider.addScope('email');
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account', // Force account selection
      });
      
      await signInWithRedirect(auth, provider);
      // User will be redirected to Google, then back to the app
      // onAuthStateChanged will handle the state update
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const signUpWithGoogle = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add additional scopes
      provider.addScope('profile');
      provider.addScope('email');
      // For signup, force account selection and consent screen
      provider.setCustomParameters({
        prompt: 'select_account consent', // Force account selection and show consent screen
      });
      
      await signInWithRedirect(auth, provider);
      // User will be redirected to Google, then back to the app
      // Firebase automatically creates a new user if they don't exist
      // onAuthStateChanged will handle the state update
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const getIdToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle,
    signUpWithGoogle,
    signOutUser,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export const getAuthTokenGetter = (authContext?: AuthContextValue) => {
  return async () => {
    if (!authContext) return null;
    return authContext.getIdToken();
  };
};

