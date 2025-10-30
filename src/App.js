/**
 * @fileoverview Componente principal da aplicação Controle Financeiro 2025
 * @author Controle Financeiro Team
 * @version 2.0.0
 * @since 1.0.0
 */

// src/App.js
import React, { useState } from 'react';
import { useUnifiedFirestore } from './hooks/useUnifiedFirestore.js';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import Dashboard from './components/Dashboard.js';
import Login from './components/Login.js';
import ThemeToggle from './components/ThemeToggle.js';
import './App.css';
import './styles/themes.css';
import './styles/animations.css';
import './styles/modern-layout.css';
import './styles/elegant-design.css';

// Importar IA
import { analyzeWithAI, getQuickStats } from './utils/aiAdvanced.js';

// Importar métricas de performance
import { recordMetric } from './utils/performanceMetrics.js';

// Expor IA globalmente para debug
if (typeof window !== 'undefined') {
  window.analyzeWithAI = analyzeWithAI;
  window.getQuickStats = getQuickStats;
}

/**
 * Componente principal da aplicação
 * 
 * Gerencia o estado global da aplicação, autenticação e renderização condicional
 * entre Login e Dashboard baseado no estado de autenticação do usuário.
 * 
 * @component
 * @example
 * ```jsx
 * <App />
 * ```
 * 
 * @returns {JSX.Element} Componente principal da aplicação
 * 
 * @features
 * - Autenticação Firebase
 * - Loading states
 * - Error handling
 * - Acessibilidade
 * - PWA support
 * - Theme support
 */
function App() {
  // Medir tempo de inicialização do App
  React.useEffect(() => {
    try {
      const navigationStart = window.performance?.timing?.navigationStart || Date.now();
      recordMetric('app_initialization', Date.now() - navigationStart);
    } catch (error) {
      console.warn('Could not measure app initialization time:', error);
    }
  }, []);

  // Hook do Firebase com recursos aprimorados
  const {
    userId,
    loading,
    error,
    migrateToMongo
  } = useUnifiedFirestore();
  
  // Verificar se há usuário autenticado baseado no userId
  const isAuthenticated = userId !== null && userId !== undefined;

  // Função de logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error);
    }
  };

  // Estado para controlar o painel de debug
  const [debugVisible, setDebugVisible] = useState(false);

  return (
    <div className="container">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>

      {/* Loading Overlay - Só mostra quando está verificando autenticação inicial OU carregando dados */}
      {loading && userId !== undefined && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">{isAuthenticated ? 'Carregando dados...' : 'Verificando autenticação...'}</div>
            <div className="loading-subtext">Aguarde um momento...</div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <div className="error-message">
              ❌ {error}
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className={`connection-status ${isAuthenticated ? 'connected' : 'disconnected'}`}>
        <div className="status-dot"></div>
        {isAuthenticated ? 'Firebase Conectado' : 'Desconectado'}
      </div>

      {/* App Header */}
      {isAuthenticated && (
        <header className="app-header">
          <h1 className="app-title">💰 Controle Financeiro 2025</h1>
          <div className="app-subtitle">
            <span>🔥 Powered by Firebase</span>
            <span>👤 {userId ? 'Logado' : 'Usuário'}</span>
            <ThemeToggle size="small" />
            <button onClick={handleLogout} className="logout-btn" aria-label="Sair">
              🚪 Sair
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main id="main-content">
        {/* Render Login or Dashboard based on authentication */}
        {isAuthenticated ? (
          <Dashboard user={{ id: userId }} />
        ) : (
          <Login />
        )}
      </main>

      {/* Debug panel (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <button
            className="debug-toggle"
            onClick={() => setDebugVisible(!debugVisible)}
          >
            Debug
          </button>
          <div className={`debug-content ${debugVisible ? 'show' : ''}`}>
            <div>Debug: Data Layer (Mongo)</div>
            <div>User ID: {userId || 'Not logged in'}</div>
            <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
            <button onClick={async () => { try { await migrateToMongo(); alert('Migração concluída'); } catch(e){ alert('Erro na migração: ' + e.message);} }}>
              Migrar dados carregados para MongoDB
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
