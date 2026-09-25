import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { auth, googleProvider, isFirebaseConfigured, firebaseConfig } from '../firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { saveUserToDb, getUsersCache, subscribeUsers } from '../firebase/firestoreService';

export const SUPER_ADMIN_EMAIL = 'franklinkyleluzano@gmail.com';

export const determineRoleForEmail = (email: string): UserRole => {
  const emailLower = (email || '').toLowerCase().trim();
  if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'admin';
  }
  // Check if role was assigned in database / cache by the admin
  const cachedUsers = getUsersCache();
  const existing = cachedUsers.find(u => u.email.toLowerCase() === emailLower);
  if (existing?.role) {
    return existing.role;
  }
  if (emailLower.includes('admin')) {
    return 'admin';
  }
  if (emailLower.includes('official')) {
    return 'official';
  }
  return 'resident';
};

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string, area?: string, role?: UserRole) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  isFirebaseActive: boolean;
  firebaseProjectId: string;
}

const STORAGE_KEY = 'martirez_96_auth_user_v5';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: UserProfile = JSON.parse(saved);
        // Guarantee franklinkyleluzano@gmail.com is always recognized as admin
        if (parsed.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          parsed.role = 'admin';
        } else {
          parsed.role = determineRoleForEmail(parsed.email);
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Sync active currentUser's role with real-time role assignments made in the Admin Dashboard
  useEffect(() => {
    const unsub = subscribeUsers((users) => {
      setCurrentUser((prev) => {
        if (!prev) return null;
        if (prev.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
          if (prev.role !== 'admin') {
            const updated: UserProfile = { ...prev, role: 'admin' };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
          }
          return prev;
        }

        const matching = users.find(u => u.email.toLowerCase() === prev.email.toLowerCase());
        if (matching && matching.role !== prev.role) {
          const updated: UserProfile = { ...prev, role: matching.role };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    });
    return () => unsub();
  }, []);

  // Sync with Firebase Auth state listener
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const email = fbUser.email || '';
          const role = determineRoleForEmail(email);

          const mappedUser: UserProfile = {
            uid: fbUser.uid,
            email,
            displayName: fbUser.displayName || email.split('@')[0] || 'Citizen',
            role,
            phone: fbUser.phoneNumber || undefined,
            createdAt: fbUser.metadata.creationTime ? new Date(fbUser.metadata.creationTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString()
          };

          saveUserToDb(mappedUser).then(saved => {
            setCurrentUser(saved);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          });
        } else {
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase onAuthStateChanged error:', e);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = cred.user.uid;
      let displayName = cred.user.displayName || normalizedEmail.split('@')[0];

      // Check if Franklin Kyle Luzano
      if (normalizedEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        displayName = 'Franklin Kyle Luzano (Admin)';
      }

      const role = determineRoleForEmail(normalizedEmail);
      const user: UserProfile = {
        uid,
        email: normalizedEmail,
        displayName,
        role,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };

      const savedUser = await saveUserToDb(user);
      setCurrentUser(savedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUser));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const uid = cred.user.uid;
      const email = cred.user.email || '';
      const displayName = cred.user.displayName || email.split('@')[0] || 'Google Resident';

      const role = determineRoleForEmail(email);
      const user: UserProfile = {
        uid,
        email,
        displayName,
        role,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };

      const savedUser = await saveUserToDb(user);
      setCurrentUser(savedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUser));
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string, area?: string, role?: UserRole) => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const uid = cred.user.uid;
      await updateFirebaseProfile(cred.user, { displayName: name });

      const effectiveRole = role || determineRoleForEmail(normalizedEmail);
      const user: UserProfile = {
        uid,
        displayName: name,
        email: normalizedEmail,
        role: effectiveRole,
        phone,
        purok: area,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };

      const savedUser = await saveUserToDb(user);
      setCurrentUser(savedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUser));
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      throw new Error('Please enter your email address first.');
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
    } catch (err: any) {
      const message = err?.message || 'Unable to send a reset email at the moment.';
      if (err?.code === 'auth/user-not-found') {
        throw new Error('No account was found with that email address.');
      }
      throw new Error(message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      role: newRole
    };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    saveUserToDb(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        loginWithGoogle,
        register,
        forgotPassword,
        logout,
        switchRole,
        isFirebaseActive: isFirebaseConfigured(),
        firebaseProjectId: firebaseConfig.projectId
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
