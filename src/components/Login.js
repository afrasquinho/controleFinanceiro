import React, { useState, useEffect } from 'react';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';
import { 
  signInWithPopup,
  signInWithRedirect, 
  GoogleAuthProvider, 
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
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

  // O hook useUnifiedFirestore agora só expõe userId para verificação de autenticação
  const { userId } = useUnifiedFirestore();

  // Lidar com resultado do redirect do Google
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ Login com Google bem-sucedido:', result);
          console.log('✅ User:', result.user);
          // O usuário será automaticamente atualizado pelo useUnifiedFirestore
        }
      } catch (error) {
        console.error('❌ Erro ao processar redirect do Google:', error);
        setError(error.message || 'Falha ao processar login com Google');
      }
    };

    handleRedirectResult();
  }, []);

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
        // Criar novo usuário
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          sanitizedEmail,
          sanitizedPassword
        );
        
        // Atualizar perfil com o nome
        if (sanitizedName.trim()) {
          await updateProfile(userCredential.user, {
            displayName: sanitizedName
          });
        }
        
        setError('');
        setIsRegister(false);
      } else {
        // Fazer login com email e senha
        await signInWithEmailAndPassword(
          auth,
          sanitizedEmail,
          sanitizedPassword
        );
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
      console.log('🔥 Tentando login com Google...');
      console.log('🔥 Auth object:', auth);
      console.log('🔥 Auth app:', auth.app);
      
      const provider = new GoogleAuthProvider();
      
      // Configurar o provider com scopes específicos
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configurar parâmetros personalizados
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('🔥 Provider configurado:', provider);
      
      // Tentar primeiro com popup (mais confiável)
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Login com Google bem-sucedido:', result);
      console.log('✅ User:', result.user);
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erro ao fazer login com Google:', err);
      console.error('❌ Detalhes do erro:', {
        code: err.code,
        message: err.message
      });
      
      // Se popup falhar, tentar com redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        console.log('🔄 Tentando com redirect...');
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          setError(redirectErr.message || 'Falha ao autenticar com Google');
          setLoading(false);
        }
      } else {
        setError(err.message || 'Falha ao autenticar com Google');
        setLoading(false);
      }
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
