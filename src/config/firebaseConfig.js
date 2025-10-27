// Firebase Configuration Helper
// Este ficheiro fornece configurações e utilitários para o Firebase

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';

import { db, auth } from '../firebase.js';

// Collections names
export const COLLECTIONS = {
  USERS: 'users',
  GASTOS: 'gastos',
  GASTOS_FIXOS: 'gastosFixos',
  RENDIMENTOS: 'rendimentos',
  DIAS_TRABALHADOS: 'diasTrabalhados',
  CATEGORIES: 'categories',
  SETTINGS: 'settings'
};

// Firestore helper functions
export const firestoreHelpers = {
  // Create a new document
  async create(collectionName, data, docId = null) {
    try {
      const collectionRef = collection(db, collectionName);
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (docId) {
        await setDoc(doc(collectionRef, docId), docData);
        return docId;
      } else {
        const docRef = await addDoc(collectionRef, docData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Read a document
  async read(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error reading document:', error);
      throw error;
    }
  },

  // Update a document
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get all documents from a collection
  async getAll(collectionName, orderByField = null, orderDirection = 'asc') {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;
      
      if (orderByField) {
        q = query(collectionRef, orderBy(orderByField, orderDirection));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error('Error getting all documents:', error);
      throw error;
    }
  },

  // Query documents with conditions
  async query(collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add orderBy
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },

  // Real-time listener
  subscribe(collectionName, callback, conditions = [], orderByField = null, orderDirection = 'asc') {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add orderBy
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      });
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      throw error;
    }
  }
};

// Auth helper functions
export const authHelpers = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Create user with email and password
  async signUp(email, password, displayName = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Send password reset email
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  // Send email verification
  async sendEmailVerification() {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  }
};

// Utility functions
export const utils = {
  // Convert Firestore timestamp to JavaScript Date
  timestampToDate(timestamp) {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate();
    }
    return new Date();
  },

  // Convert JavaScript Date to Firestore timestamp
  dateToTimestamp(date) {
    return Timestamp.fromDate(date);
  },

  // Generate a unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format currency
  formatCurrency(amount, currency = 'EUR', locale = 'pt-PT') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};

export default {
  COLLECTIONS,
  firestoreHelpers,
  authHelpers,
  utils
};
