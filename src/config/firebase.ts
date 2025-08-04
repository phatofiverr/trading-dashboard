// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABo68CybsBWK6eFZjKhu8JvmHNMc65Ah0",
  authDomain: "trading-dashboard-3dc89.firebaseapp.com",
  projectId: "trading-dashboard-3dc89",
  storageBucket: "trading-dashboard-3dc89.firebasestorage.app",
  messagingSenderId: "1080313380195",
  appId: "1:1080313380195:web:767ec1f0b1e0cc68c8a756",
  measurementId: "G-K2923TJMDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
