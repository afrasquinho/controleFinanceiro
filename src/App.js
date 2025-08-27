// src/App.js
import React, { useState } from 'react';
import { mesesInfo } from './data/monthsData';
import { useFirebaseData } from './hooks/useFirebaseData';
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
  } = useFirebaseData();

  // Loading state
  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="ai-loading" style={{ fontSize: '48px', marginBottom: '20px' }}>💰</div>
          <h2>Carregando Controle Financeiro...</h2>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Inicializando IA e carregando seus dados
          </div>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            margin: '20px auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #3498db, #27ae60)',
              animation: 'loading 2s infinite'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#e74c3c' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h2>Erro: {error}</h2>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
            Ocorreu um problema ao carregar a aplicação
          </div>
          <button 
            onClick={() => setError(null)} 
            className="btn"
            style={{ 
              marginTop: '20px',
              background: '#e74c3c',
              color: 'white'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
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
          <span>📝 {Object.values(gastosData).flat().length} transações</span>
          {aiAnalysis && (
            <>
              <span>•</span>
              <span style={{ 
                color: aiAnalysis.healthScore.score > 70 ? '#27ae60' : 
                       aiAnalysis.healthScore.score > 40 ? '#f39c12' : '#e74c3c',
                fontWeight: 'bold'
              }}>
                ❤️ Saúde: {aiAnalysis.healthScore.score}/100
              </span>
            </>
          )}
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
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
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
            {/* Pulse effect */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 2s infinite'
            }}></div>
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
                onClick={refreshAI}
                className="btn"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
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
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
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
                  borderRadius: '50%',
                  fontSize: '8px'
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
          onAddGasto={(data, desc, valor) => addGasto(mes.id, data, desc, valor)}
          onRemoveGasto={(index) => removeGasto(mes.id, index)}
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
          onExportData={exportData}
          onImportData={importData}
          onClearAllData={clearAllData}
          currentMonth={currentTab}
        />
      </div>

      {/* Informações adicionais */}
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

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#6c757d',
        fontSize: '12px',
        borderTop: '1px solid #dee2e6',
        marginTop: '60px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>💰 Controle Financeiro 2025</strong> - Powered by IA JavaScript Avançada
        </div>
        <div style={{ marginBottom: '10px', opacity: 0.8 }}>
          🧠 Algoritmos: Regressão Linear • Média Móvel Exponencial • Z-Score • Análise Sazonal
        </div>
        <div style={{ opacity: 0.6 }}>
          Desenvolvido com React • Machine Learning • Análise Preditiva
        </div>
        
        {/* Estatísticas do footer */}
        {Object.keys(gastosData).length > 0 && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '6px',
            display: 'inline-block'
          }}>
                        <div style={{
              display: 'flex',
              gap: '20px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '11px'
            }}>
              <span>📊 {Object.values(gastosData).flat().length} transações processadas</span>
              <span>💰 {Object.keys(gastosData).filter(month => gastosData[month].length > 0).length} meses ativos</span>
              {aiAnalysis && (
                <>
                  <span>🤖 {aiAnalysis.metadata.algorithmsUsed.length} algoritmos IA</span>
                  <span>⚡ {aiAnalysis.metadata.processingTime}ms processamento</span>
                </>
              )}
            </div>
          </div>
        )}
      </footer>

      {/* Estilos inline para animações */}
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .ai-loading {
          animation: pulse 2s infinite;
        }
        
        .summary-card {
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .summary-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .tab {
          transition: all 0.3s ease;
          position: relative;
        }
        
        .tab:hover {
          transform: translateY(-2px);
        }
        
        .tab.active {
          animation: fadeIn 0.5s ease-out;
        }
        
        .container {
          animation: fadeIn 0.8s ease-out;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .tabs {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
          }
          
          .tab {
            font-size: 12px;
            padding: 8px 4px;
          }
          
          .summary-card {
            padding: 10px !important;
          }
          
          .container {
            padding: 10px;
          }
          
          h1 {
            font-size: 1.8rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .tabs {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .summary-card {
            padding: 8px !important;
          }
          
          .summary-card div:first-child {
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Toast notifications (se necessário) */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#e74c3c',
          color: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)',
          zIndex: 2000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '10px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Indicador de carregamento da IA */}
      {showAI && loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          zIndex: 3000,
          textAlign: 'center'
        }}>
          <div className="ai-loading" style={{ fontSize: '32px', marginBottom: '10px' }}>🤖</div>
          <div>Processando análise IA...</div>
        </div>
      )}

      {/* Shortcuts de teclado (Easter egg) */}
      <div style={{ display: 'none' }}>
        {/* Adicionar listeners de teclado se necessário */}
        {typeof window !== 'undefined' && window.addEventListener('keydown', (e) => {
          if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
              case 'i':
                e.preventDefault();
                setShowAI(!showAI);
                break;
              case 'e':
                e.preventDefault();
                exportData();
                break;
              default:
                break;
            }
          }
        })}
      </div>

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '10px',
          zIndex: 1000
        }}>
          Debug: {Object.keys(gastosData).length} meses | {Object.values(gastosData).flat().length} gastos
          {aiAnalysis && ` | IA: ${aiAnalysis.healthScore.score}/100`}
        </div>
      )}
    </div>
  );
}

export default App;
