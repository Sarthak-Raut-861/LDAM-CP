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
          const localUser = localStorage.getItem('mediglow_auth_session') || localStorage.getItem('smartdose_auth_session');
          if (localUser) {
            try {
              setUser(JSON.parse(localUser));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Local session check: do NOT auto-login. Require explicit user login.
      const stored = typeof window !== 'undefined'
        ? localStorage.getItem('mediglow_auth_session') || localStorage.getItem('smartdose_auth_session')
        : null;

      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
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
      localStorage.setItem('mediglow_auth_session', JSON.stringify(u));
    } else {
      // Local authenticated session
      const isDoc = email.toLowerCase().includes('roy') || email.toLowerCase().includes('doctor');
      const mockUser: UserProfile = {
        uid: `usr_${Date.now()}`,
        email,
        displayName: isDoc
          ? 'Dr. Anita Roy (Cardiologist)'
          : email.toLowerCase().includes('patient')
          ? 'Robert Vance (Patient)'
          : email.split('@')[0].replace('.', ' ').toUpperCase(),
        emergencyContact: '+91 98765 43210 (Dr. Vance - Son)',
        doctorName: 'Dr. Anita Roy (Cardiologist, Apollo Health)',
      };
      setUser(mockUser);
      localStorage.setItem('mediglow_auth_session', JSON.stringify(mockUser));
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    if (isRealFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const u: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: name,
      };
      setUser(u);
      localStorage.setItem('mediglow_auth_session', JSON.stringify(u));
    } else {
      const mockUser: UserProfile = {
        uid: `usr_${Date.now()}`,
        email,
        displayName: name,
        emergencyContact: '+91 98765 43210',
        doctorName: 'Dr. Anita Roy',
      };
      setUser(mockUser);
      localStorage.setItem('mediglow_auth_session', JSON.stringify(mockUser));
    }
  };

  const logout = async () => {
    if (isRealFirebaseConfigured && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    localStorage.removeItem('mediglow_auth_session');
    localStorage.removeItem('smartdose_auth_session');
  };

  const resetPassword = async (email: string) => {
    if (isRealFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...profile };
    setUser(updated);
    localStorage.setItem('mediglow_auth_session', JSON.stringify(updated));
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
