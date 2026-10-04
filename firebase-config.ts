// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEiQuHkyXlKIyppw2WdiQXqNklozx3X3c",
  authDomain: "carvaan-7e110.firebaseapp.com",
  projectId: "carvaan-7e110",
  storageBucket: "carvaan-7e110.firebasestorage.app",
  messagingSenderId: "780453235619",
  appId: "1:780453235619:web:8990ed78812accc847a816",
  measurementId: "G-JZFR4X6RRC"
}; 

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);