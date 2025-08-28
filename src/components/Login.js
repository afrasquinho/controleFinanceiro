import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app, db } from '../firebase'; // Import db along with app
import { doc, setDoc } from 'firebase/firestore'; // Import doc and setDoc
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginResult = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login result:', loginResult); // Log the result of the login attempt
      const user = auth.currentUser; // Get the authenticated user
      // Create user document in Firestore
      const userDocRef = doc(db, `users/${user.uid}/financeiro/2025`);
      await setDoc(userDocRef, { createdAt: new Date() }, { merge: true });
      console.log('Attempting to create user document at:', userDocRef.path); // Log the document path
      console.log('User document created or updated:', user.uid);
      console.log('✅ Login bem-sucedido', user); // Log do usuário autenticado
    } catch (err) {
      console.error('❌ Erro no login:', err);
      console.log('Login attempt with email:', email); // Log the email used for login
      console.log('Error details:', err); // Log the error details
      console.log('Error message:', err.message); // Log the error message
      setError('Falha no login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      const user = auth.currentUser; // Get the authenticated user
      console.log('User logged in with Google:', user); // Log the user object
      // Create user document in Firestore
      const userDocRef = doc(db, `users/${user.uid}/financeiro/2025`);
      await setDoc(userDocRef, { createdAt: new Date() }, { merge: true });
      console.log('Attempting to create user document at:', userDocRef.path); // Log the document path
      console.log('User document created or updated:', user.uid);
      console.log('✅ Login com Google bem-sucedido');
    } catch (err) {
      console.error('❌ Erro no login com Google:', err);
      setError('Falha no login com Google: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>🔐 Login</h2>
        
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
            style={{ width: '100%', marginBottom: '15px' }}
          >
            {loading ? 'Entrando...' : 'Entrar com Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <span>ou</span>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="google-login-btn"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Entrando...' : 'Entrar com Google'}
        </button>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#666' 
        }}>
          <p>
            Não tem uma conta? Crie uma no{' '}
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#667eea' }}
            >
              Firebase Console
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
