import React, { useState } from 'react';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase.js';
import './Login.css';

/**
 * Login component for user authentication
 *
 * Provides email/password login, registration, and Google sign-in.
 * Uses Firebase for authentication.
 * Includes input validation and sanitization for security.
 *
 * @returns {JSX.Element} Login form with authentication options
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { 
    registerUser: register, 
    loginUser: login 
  } = useUnifiedFirestore();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedName = sanitizeInput(name);

    // Validation
    if (!validateEmail(sanitizedEmail)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    if (!validatePassword(sanitizedPassword)) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    if (isRegister && !sanitizedName.trim()) {
      setError('Por favor, insira seu nome.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        await register(sanitizedEmail, sanitizedPassword, sanitizedName);
        setError('');
        setIsRegister(false);
      } else {
        await login(sanitizedEmail, sanitizedPassword);
      }
    } catch (err) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err);
      setError(err.message || 'Falha ao autenticar com Google');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 id="login-form-title" style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isRegister ? '📝 Registro' : '🔐 Login'}
        </h2>
        
        {error && (
          <div
            className="error-message"
            style={{ marginBottom: '20px' }}
            role="alert"
            aria-live="polite"
            id="login-error"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} aria-labelledby="login-form-title">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Nome:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegister}
                disabled={loading}
                aria-describedby={error ? "login-error" : undefined}
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              aria-describedby={error ? "login-error" : undefined}
              autoComplete="email"
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
              aria-describedby={error ? "login-error" : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{ width: '100%', marginBottom: '15px' }}
            aria-describedby={loading ? "loading-status" : undefined}
          >
            {loading ? (isRegister ? 'Registrando...' : 'Entrando...') : (isRegister ? 'Registrar' : 'Entrar')}
          </button>
        </form>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-login-btn"
          style={{ width: '100%', marginBottom: '15px' }}
        >
          🔐 {loading ? 'Conectando...' : 'Continuar com Google'}
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
            disabled={loading}
          >
            {isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Registre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
