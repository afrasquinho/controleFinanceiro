
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAbR1oVfUjYsyTwhCurqDWvV05QF_VIP9s",
  authDomain: "controlefinanceiro-694b8.firebaseapp.com",
  projectId: "controlefinanceiro-694b8",
  storageBucket: "controlefinanceiro-694b8.firebasestorage.app",
  messagingSenderId: "749261073531",
  appId: "1:749261073531:web:85e6ee8c92155b0b3dc6de",
  measurementId: "G-3WYL3CY7XE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
