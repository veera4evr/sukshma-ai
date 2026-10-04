import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAmps_cWxuyvGsPFUO_B3_NoRV3KY0kzWY",
  authDomain: "sukshma-ai.firebaseapp.com",
  projectId: "sukshma-ai",
  storageBucket: "sukshma-ai.firebasestorage.app",
  messagingSenderId: "996689953769",
  appId: "1:996689953769:web:e4edd771ce2d6950a40178",
  measurementId: "G-P7XE1G5SYM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics conditionally to avoid SSR issues or adblocker errors
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;
