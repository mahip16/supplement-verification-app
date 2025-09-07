// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5-7i6H92w2bM_j3HhxN9sKJKKeMLOiaw",
  authDomain: "supplescan-8a3c6.firebaseapp.com",
  projectId: "supplescan-8a3c6",
  storageBucket: "supplescan-8a3c6.firebasestorage.app",
  messagingSenderId: "917590416495",
  appId: "1:917590416495:web:04835da9a6a078c2a6419a"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getAuth(FIREBASE_APP);