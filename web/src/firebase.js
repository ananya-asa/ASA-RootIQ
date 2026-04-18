import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "asa-rootiq.firebaseapp.com",
    projectId: "asa-rootiq",
    storageBucket: "asa-rootiq.firebasestorage.app",
    messagingSenderId: "232978491828",
    appId: "1:232978491828:web:c9d1d0972a39de5bbcaae1"
  };

  const app=initializeApp(firebaseConfig);
  export const db=getFirestore(app);
  export const auth=getAuth(app);
  export const provider=new GoogleAuthProvider();

