
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
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validar se todas as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}. Please check your .env file.`);
}

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
