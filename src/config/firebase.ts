// Initialize Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBDENyOqn_E2k-39hMnQmpbbhHc7FE4ZMw",
  authDomain: "journal-d7f9e.firebaseapp.com",
  projectId: "journal-d7f9e",
  storageBucket: "journal-d7f9e.firebasestorage.app",
  messagingSenderId: "352208955899",
  appId: "1:352208955899:web:26b16660ede821bd0c835e",
  measurementId: "G-167BD0P4FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 