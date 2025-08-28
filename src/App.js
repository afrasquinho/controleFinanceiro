// src/App.js
import React from 'react';
import { useUnifiedFirestore } from './hooks/useUnifiedFirestore';
import Dashboard from './components/Dashboard';
import Login from './components/Login'; 
import './App.css';

// Importar IA
import { analyzeWithAI, getQuickStats } from './utils/aiAdvanced';

// Expor IA globalmente para debug
if (typeof window !== 'undefined') {
  window.analyzeWithAI = analyzeWithAI;
  window.getQuickStats = getQuickStats;
  console.log('🔧 IA exposta globalmente via App.js');
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

  return (
    <div className="container">
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
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: '0 0 10px 0'
        }}>
          💰 Controle Financeiro 2025
        </h1>
        <div style={{ 
          fontSize: '14px', 
          color: '#6c757d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <span>🤖 Powered by IA Avançada</span>
          <span>•</span>
          <span>📅 {Object.keys(gastosData).length} meses ativos</span>
          <span>•</span>
          <span>📝 {totalTransactions} transações</span>
        </div>
      </header>

      {/* Render Login or Dashboard based on authentication */}
      {userId ? (
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
      ) : (
        <Login />
      )}
      {/* Log para debug */}

      {/* Informações para novos usuários */}
      {Object.keys(gastosData).length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          margin: '40px 0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
          <h3 style={{ color: '#495057', marginBottom: '15px' }}>
            Bem-vindo ao Controle Financeiro 2025!
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            Comece adicionando seus primeiros gastos em qualquer mês. 
            Nossa IA irá analisar automaticamente seus padrões financeiros e fornecer insights personalizados.
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '20px',
            flexWrap: 'wrap',
            fontSize: '14px',
            color: '#6c757d'
          }}>
            <div>🤖 IA Avançada</div>
            <div>📊 Análise de Padrões</div>
            <div>🔮 Previsões Inteligentes</div>
            <div>💡 Insights Personalizados</div>
          </div>
        </div>
      )}

      {/* Debug panel (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '11px',
          zIndex: 1000
        }}>
          <div>Debug: {Object.keys(gastosData).length} meses</div>
          <div>Status: {connectionStatus}</div>
        </div>
      )}
    </div>
  );
}

export default App;
