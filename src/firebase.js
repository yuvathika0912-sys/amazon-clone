import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBB35-MxuxqRG9sFCcRdzlupJs9peys--I",
  authDomain: "clone-3b1c8.firebaseapp.com",
  projectId: "clone-3b1c8",
  storageBucket: "clone-3b1c8.firebasestorage.app",
  messagingSenderId: "156552079203",
  appId: "1:156552079203:web:185d21503e0875ee261556",
  measurementId: "G-BXG82LYWEZ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;