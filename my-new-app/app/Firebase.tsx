// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "graph-website-f0b45.firebaseapp.com",
  projectId: "graph-website-f0b45",
  storageBucket: "graph-website-f0b45.firebasestorage.app",
  messagingSenderId: "442927523498",
  appId: "1:442927523498:web:d849fd846734c05b78d2d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const firestore = getFirestore();

const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence); // Ensure persistence is set

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export { app, auth, provider, firestore, signInWithGoogle, onAuthStateChanged};
