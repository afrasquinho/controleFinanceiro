
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase - pode ser movida para variáveis de ambiente em produção
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAbR1oVfUjYsyTwhCurqDWvV05QF_VIP9s",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "controlefinanceiro-694b8.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "controlefinanceiro-694b8",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "controlefinanceiro-694b8.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "749261073531",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:749261073531:web:85e6ee8c92155b0b3dc6de",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-3WYL3CY7XE"
};

// Inicialização do Firebase com tratamento de erro
let app;
let db;
let auth;

try {
  console.log('🔥 Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('✅ Firebase inicializado com sucesso');
  console.log('📊 Projeto:', firebaseConfig.projectId);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  throw new Error(`Falha na inicialização do Firebase: ${error.message}`);
}

export { db, auth };
export default app;
