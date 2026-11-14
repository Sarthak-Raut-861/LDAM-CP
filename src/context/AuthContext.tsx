"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/types';
import { auth, isRealFirebaseConfigured } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseActive: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const DEMO_USER: UserProfile = {
  uid: 'usr_demo_83921',
  email: 'patient.care@smartdose.health',
  displayName: 'Robert Vance (Patient)',
  emergencyContact: '+91 98765 43210 (Dr. Vance - Son)',
  doctorName: 'Dr. Anita Roy (Cardiologist, Apollo Health)',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);

  useEffect(() => {
    // Check if real Firebase auth is available
    if (isRealFirebaseConfigured && auth) {
      setIsFirebaseActive(true);
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Authorized Patient',
            photoURL: fbUser.photoURL || undefined,
          });
        } else {
          // Check local session
          const localUser = localStorage.getItem('smartdose_auth_session');
          if (localUser) {
            setUser(JSON.parse(localUser));
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local fallback mode: check localStorage or initialize with demo user
      const stored = localStorage.getItem('smartdose_auth_session');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(DEMO_USER);
        }
      } else {
        setUser(DEMO_USER);
        localStorage.setItem('smartdose_auth_session', JSON.stringify(DEMO_USER));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isRealFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const u: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || 'Authorized Patient',
      };
      setUser(u);
      localStorage.setItem('smartdose_auth_session', JSON.stringify(u));
    } else {
      // Local simulated auth
      const mockUser: UserProfile = {
        uid: `usr_${Date.now()}`,
        email,
        displayName: email.split('@')[0].replace('.', ' ').toUpperCase(),
        emergencyContact: '+91 98765 43210',
        doctorName: 'Dr. Anita Roy',
      };
      setUser(mockUser);
      localStorage.setItem('smartdose_auth_session', JSON.stringify(mockUser));
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (isRealFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const u: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: name,
      };
      setUser(u);
      localStorage.setItem('smartdose_auth_session', JSON.stringify(u));
    } else {
      const mockUser: UserProfile = {
        uid: `usr_${Date.now()}`,
        email,
        displayName: name,
      };
      setUser(mockUser);
      localStorage.setItem('smartdose_auth_session', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isRealFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    localStorage.removeItem('smartdose_auth_session');
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isRealFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Simulate password reset
      return new Promise<void>((resolve) => setTimeout(resolve, 600));
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profile };
    setUser(updated);
    localStorage.setItem('smartdose_auth_session', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseActive,
        login,
        signup,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

