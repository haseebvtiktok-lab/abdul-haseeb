
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYy971Vypl4aSAkgKQdnn6hUe8TAnMbrs",
  authDomain: "newsite-6a5ea.firebaseapp.com",
  databaseURL: "https://newsite-6a5ea-default-rtdb.firebaseio.com",
  projectId: "newsite-6a5ea",
  storageBucket: "newsite-6a5ea.firebasestorage.app",
  messagingSenderId: "355699390691",
  appId: "1:355699390691:web:d2c3f8e6a5b4d7c9f1e0a9" // Completed App ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
