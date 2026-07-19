import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyC4pT1AeetNsWJR2RJs1-1RKq0UA9SeS64",
  authDomain: "amit-dev-f8f1a.firebaseapp.com",
  projectId: "amit-dev-f8f1a",
  storageBucket: "amit-dev-f8f1a.firebasestorage.app",
  messagingSenderId: "38174103846",
  appId: "1:38174103846:web:032f669571daef30c149e7",
  measurementId: "G-ZF3B8YWJ0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const googleProvider = new GoogleAuthProvider()
export const auth = getAuth(app)