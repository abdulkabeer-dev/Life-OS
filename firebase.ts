
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPX5E4KE75aPxkgJEJgc7uf9ilEayqY0s",
  authDomain: "lifeos-3539c.firebaseapp.com",
  projectId: "lifeos-3539c",
  storageBucket: "lifeos-3539c.firebasestorage.app",
  messagingSenderId: "1004669118116",
  appId: "1:1004669118116:web:a81d6f5d0fd8a446d26831",
  measurementId: "G-9P5C2WJCJ9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
