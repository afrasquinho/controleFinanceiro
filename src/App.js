// src/App.js
import React, { useState } from 'react';
import { mesesInfo } from './data/monthsData';
import { useUnifiedFirestore } from './hooks/useUnifiedFirestore';
import MonthContent from './components/MonthContent';
import AIDashboard from './components/AIDashboard';
import QuickStats from './components/QuickStats';
import DownloadSection from './components/DownloadSection';
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
  const [currentTab, setCurrentTab] = useState('jan');
  const [showAI, setShowAI] = useState(false);
  
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
  removeGasto
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

      {/* Estatísticas rápidas */}
      <QuickStats 
        gastosData={gastosData} 
        onOpenAI={() => setShowAI(true)}
      />

      {/* Botão IA flutuante (quando IA não está aberta) */}
      {!showAI && Object.keys(gastosData).length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowAI(true)}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
            }}
            title="Abrir Assistente IA Completo"
          >
            🤖
          </button>
        </div>
      )}

      {/* Dashboard IA */}
      {showAI && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem' }}>
                🤖 Assistente Financeiro IA
              </h2>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>
                Análise avançada com Machine Learning
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                🔄 Atualizar
              </button>
              <button
                onClick={() => setShowAI(false)}
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px'
                }}
              >
                ✕ Fechar
              </button>
            </div>
          </div>
          
          <AIDashboard 
            gastosData={gastosData} 
            rendimentosData={{}}
            currentMonth={currentTab}
          />
        </div>
      )}

      {/* Navegação por meses */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          📅 Navegação por Meses
          <span style={{ 
            fontSize: '12px', 
            background: '#e9ecef', 
            padding: '2px 8px', 
            borderRadius: '12px',
            color: '#6c757d'
          }}>
            {currentTab.toUpperCase()}
          </span>
        </h3>
        
        <div className="tabs">
          {mesesInfo.map(mes => (
            <button
              key={mes.id}
              className={`tab ${currentTab === mes.id ? 'active' : ''}`}
              onClick={() => setCurrentTab(mes.id)}
              style={{
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {mes.nome}
              {/* Indicador de dados */}
              {gastosData[mes.id] && gastosData[mes.id].length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '8px',
                  height: '8px',
                  background: '#27ae60',
                  borderRadius: '50%'
                }}></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo dos meses */}
      {mesesInfo.map(mes => (
        <MonthContent
          key={mes.id}
          mes={mes}
          isActive={currentTab === mes.id}
          gastos={gastosData[mes.id] || []}
          onAddGasto={addGasto}
          onRemoveGasto={removeGasto}
          gastosData={gastosData}
        />
      ))}

      {/* Seção de download e configurações */}
      <div style={{ marginTop: '40px' }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ⚙️ Configurações e Backup
        </h3>
        
        <DownloadSection
          gastosData={gastosData}
          onExportData={() => {
            console.log('Função exportData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          onImportData={() => {
            console.log('Função importData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          onClearAllData={() => {
            console.log('Função clearAllData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          currentMonth={currentTab}
        />
      </div>

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
