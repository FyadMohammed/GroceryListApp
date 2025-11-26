import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBCMF9ETi3R0UijOfqIQ_n6zJOAVJ_Rp3c",
  authDomain: "grocerylistapp-79849.firebaseapp.com",
  projectId: "grocerylistapp-79849",
  storageBucket: "grocerylistapp-79849.firebasestorage.app",
  messagingSenderId: "936341780359",
  appId: "1:936341780359:web:310c555cca4295aa7ec522"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
