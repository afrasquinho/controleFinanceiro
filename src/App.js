// src/App.js
import React, { useState } from 'react';
import { useUnifiedFirestore } from './hooks/useUnifiedFirestore.js';
import Dashboard from './components/Dashboard.js';
import Login from './components/Login.js';
import './App.css';

// Importar IA
import { analyzeWithAI, getQuickStats } from './utils/aiAdvanced.js';

// Expor IA globalmente para debug
if (typeof window !== 'undefined') {
  window.analyzeWithAI = analyzeWithAI;
  window.getQuickStats = getQuickStats;
}

function App() {
  // Hook do Firestore com recursos aprimorados
  const {
    gastosData,
    loading,
    error,
    connectionStatus,
    totalTransactions,
    clearError,
    reloadData,
    addGasto,
    removeGasto,
    userId // Add userId to check authentication
  } = useUnifiedFirestore();

  // Estado para controlar o painel de debug
  const [debugVisible, setDebugVisible] = useState(false);

  return (
    <div className="container">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Conectando ao Firebase</div>
            <div className="loading-subtext">Carregando seus dados financeiros...</div>
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
            <div className="error-actions">
              <button 
                className="error-btn" 
                onClick={clearError}
                title="Fechar erro"
              >
                ✕ Fechar
              </button>
              <button 
                className="error-btn" 
                onClick={reloadData}
                title="Tentar novamente"
              >
                🔄 Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status Indicator */}
      <div className={`connection-status ${connectionStatus}`}>
        <div className="status-dot"></div>
        {connectionStatus === 'connecting' && 'Conectando...'}
        {connectionStatus === 'connected' && 'Firebase Conectado'}
        {connectionStatus === 'error' && 'Erro de Conexão'}
      </div>

      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          💰 Controle Financeiro 2025
        </h1>
        <div className="app-subtitle">
          <span>🤖 Powered by IA Avançada</span>
          <span>•</span>
          <span>📅 {Object.keys(gastosData).length} meses ativos</span>
          <span>•</span>
          <span>📝 {totalTransactions} transações</span>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Render Login or Dashboard based on authentication */}
        {userId ? (
          <>
            <Dashboard
              gastosData={gastosData}
              loading={loading}
              error={error}
              connectionStatus={connectionStatus}
              totalTransactions={totalTransactions}
              clearError={clearError}
              reloadData={reloadData}
              addGasto={addGasto}
              removeGasto={removeGasto}
            />

            {/* Informações para novos usuários */}
            {Object.keys(gastosData).length === 0 && (
              <div className="welcome-section">
                <div className="welcome-emoji">🚀</div>
                <h3 className="welcome-title">
                  Bem-vindo ao Controle Financeiro 2025!
                </h3>
                <p className="welcome-text">
                  Comece adicionando seus primeiros gastos em qualquer mês.
                  Nossa IA irá analisar automaticamente seus padrões financeiros e fornecer insights personalizados.
                </p>
                <div className="welcome-features">
                  <div>🤖 IA Avançada</div>
                  <div>📊 Análise de Padrões</div>
                  <div>🔮 Previsões Inteligentes</div>
                  <div>💡 Insights Personalizados</div>
                </div>
              </div>
            )}
          </>
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
            <div>Debug: {Object.keys(gastosData).length} meses</div>
            <div>Status: {connectionStatus}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
