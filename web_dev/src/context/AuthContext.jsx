import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Google Login
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid')) {
        console.warn("Using mock Google user because Firebase API key is invalid.");
        const mockUser = { uid: 'mock-123', displayName: 'Demo User', email: 'demo@example.com', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo' };
        setCurrentUser(mockUser);
        return mockUser;
      }
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Apple Login
  const loginWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/api-key-not-valid' || error.message?.includes('api-key-not-valid')) {
        console.warn("Using mock Apple user because Firebase API key is invalid.");
        const mockUser = { uid: 'mock-456', displayName: 'Apple Fan', email: 'apple@example.com', photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Apple' };
        setCurrentUser(mockUser);
        return mockUser;
      }
      console.error("Apple login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (currentUser?.uid?.startsWith('mock-')) {
        setCurrentUser(null);
        return;
      }
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    // We wrap this in a try-catch to prevent crash if Firebase config is wholly invalid
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!currentUser?.uid?.startsWith('mock-')) {
          setCurrentUser(user);
        }
        setLoading(false);
      });
      return unsubscribe;
    } catch (e) {
      setLoading(false);
    }
  }, [currentUser]);

  const value = {
    currentUser,
    loginWithGoogle,
    loginWithApple,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
