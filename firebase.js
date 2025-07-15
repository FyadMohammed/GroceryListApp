// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4gkuwPnowNRnNu1KDZCbyoSUIb4hE3qU",
  authDomain: "grocerylistapp-a8404.firebaseapp.com",
  projectId: "grocerylistapp-a8404",
  storageBucket: "grocerylistapp-a8404.firebasestorage.app",
  messagingSenderId: "405247521470",
  appId: "1:405247521470:web:69c3e6a069aca1086764ef",
  measurementId: "G-GCZ80QVCPN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);