import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCZ5pUH41s-EdSKi-NiH8gu69R-OxZk3YM",
  authDomain: "martirezdel96-38d01.firebaseapp.com",
  projectId: "martirezdel96-38d01",
  storageBucket: "martirezdel96-38d01.firebasestorage.app",
  messagingSenderId: "258904484542",
  appId: "1:258904484542:web:d2672a89008706a31e0cef"
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export const isFirebaseConfigured = (): boolean => true;
