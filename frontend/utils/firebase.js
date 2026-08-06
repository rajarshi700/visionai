// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aichat-dde9f.firebaseapp.com",
  projectId: "aichat-dde9f",
  storageBucket: "aichat-dde9f.firebasestorage.app",
  messagingSenderId: "1021052998652",
  appId: "1:1021052998652:web:f7254e74e1365d41059879"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()