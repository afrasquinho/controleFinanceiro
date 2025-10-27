
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAbR1oVfUjYsyTwhCurqDWvV05QF_VIP9s",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "controlefinanceiro-694b8.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "controlefinanceiro-694b8",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "controlefinanceiro-694b8.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "749261073531",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:749261073531:web:85e6ee8c92155b0b3dc6de",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-3WYL3CY7XE"
};

// Log da configuração Firebase (sem mostrar dados sensíveis)
console.log('🔥 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'undefined'
});

// Initialize Firebase
let app;
let db;
let auth;
let storage;
let functions;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  
  // Initialize Analytics only in production and if measurementId is available
  if (process.env.NODE_ENV === 'production' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
  
  // Connect to emulators in development
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATORS === 'true') {
    try {
      // Firestore emulator
      if (!db._delegate._databaseId.projectId.includes('demo-')) {
        connectFirestoreEmulator(db, 'localhost', 8080);
      }
      
      // Auth emulator
      connectAuthEmulator(auth, 'http://localhost:9099');
      
      // Storage emulator
      connectStorageEmulator(storage, 'localhost', 9199);
      
      // Functions emulator
      connectFunctionsEmulator(functions, 'localhost', 5001);
      
      console.log('🔥 Connected to Firebase emulators');
    } catch (emulatorError) {
      console.warn('⚠️ Could not connect to Firebase emulators:', emulatorError.message);
    }
  }
  
  console.log('✅ Firebase initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error(`Falha na inicialização do Firebase: ${error.message}`);
}

// Export Firebase services
export { 
  app, 
  db, 
  auth, 
  storage, 
  functions, 
  analytics 
};

// Export default app
export default app;
