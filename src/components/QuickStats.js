// src/App.js (versão final melhorada)
import React, { useState } from 'react';
import { mesesInfo } from './data/monthsData';
import { useFinanceData } from './hooks/useFinanceData';
import MonthContent from './components/MonthContent';
import AIDashboard from './components/AIDashboard';
import QuickStats from './components/QuickStats';
import DownloadSection from './components/DownloadSection';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('jan');
  const [showAI, setShowAI] = useState(false);
  
  const { 
    gastosData, 
    aiAnalysis,
    loading, 
    error, 
    addGasto, 
    removeGasto, 
    exportData, 
    importData, 
    clearAllData,
    refreshAI,
    setError
  } = useFinanceData();

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="ai-loading" style={{ fontSize: '48px', marginBottom: '20px' }}>💰</div>
          <h2>Carregando Controle Financeiro...</h2>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Inicializando IA e carregando seus dados
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#e74c3c' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2>Erro: {error}</h2>
          <button 
            onClick={() => setError(null)} 
            className="btn"
            style={{ marginTop: '20px' }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>💰 Controle Financeiro 2025</h1>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Powered by IA Avançada • {Object.keys(gastosData).length} meses • {
            Object.values(gastosData).flat().length
          } transações
        </div>
      </header>

      {/* Estatísticas rápidas */}
      <QuickStats 
        gastosData={gastosData} 
        onOpenAI={() => setShowAI(true)}
      />

      {/* Botão IA flutuante */}
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
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            title="Abrir Assistente IA"
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
            marginBottom: '15px'
          }}>
            <h2 style={{ margin: 0 }}>🤖 Assistente Financeiro IA</h2>
            <div>
              <button
                onClick={refreshAI}
                className="btn"
                style={{
                  marginRight: '10px',
                  background: '#17a2b8',
                  fontSize: '14px',
                  padding: '8px 16px'
                }}
              >
                🔄 Atualizar IA
              </button>
              <button
                onClick={() => setShowAI(false)}
                className="btn"
                style={{
                  background: '#6c757d',
                  fontSize: '14px',
                  padding: '8px 16px'
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
            aiAnalysis={aiAnalysis}
          />
        </div>
      )}

      {/* Tabs dos meses */}
      <div className="tabs">
        {mesesInfo.map(mes => (
          <button
            key={mes.id}
            className={`tab ${currentTab === mes.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(mes.id)}
          >
            {mes.nome}
          </button>
        ))}
      </div>

      {/* Conteúdo dos meses */}
      {mesesInfo.map(mes => (
        <MonthContent
          key={mes.id}
          mes={mes}
          isActive={currentTab === mes.id}
          gastos={gastosData[mes.id] || []}
          onAddGasto={(data, desc, valor) => addGasto(mes.id, data, desc, valor)}
          onRemoveGasto={(index) => removeGasto(mes.id, index)}
          gastosData={gastosData}
        />
      ))}

      {/* Seção de download */}
      <DownloadSection
        gastosData={gastosData}
        onExportData={exportData}
        onImportData={importData}
        onClearAllData={clearAllData}
        currentMonth={currentTab}
      />

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '30px 20px',
        color: '#6c757d',
        fontSize: '12px',
        borderTop: '1px solid #dee2e6',
        marginTop: '40px'
      }}>
        <div>💰 Controle Financeiro 2025 - Powered by IA JavaScript Avançada</div>
        <div style={{ marginTop: '5px' }}>
          Algoritmos: Regressão Linear • Média Móvel • Z-Score • Análise Sazonal
        </div>
      </footer>
    </div>
  );
}

export default App;
