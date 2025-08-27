// src/App.js
import React, { useState } from 'react';
import { mesesInfo } from './data/monthsData';
import { useFinanceData } from './hooks/useFinanceData';
import MonthContent from './components/MonthContent';
import AIDashboard from './components/AIDashboard'; // NOVA IMPORTAÇÃO
import DownloadSection from './components/DownloadSection';
import './App.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState('jan');
  const [showAI, setShowAI] = useState(false); // NOVO ESTADO
  const { 
    gastosData, 
    loading, 
    error, 
    addGasto, 
    removeGasto, 
    exportData, 
    importData, 
    clearAllData 
  } = useFinanceData();

  if (loading) {
    return (
      <div className="container">
        <h1>Carregando dados...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>Erro: {error}</h1>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>💰 Controle Financeiro 2025</h1>
      
      {/* Botão para mostrar/esconder IA */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setShowAI(!showAI)}
          className="btn"
          style={{
            background: showAI ? '#e74c3c' : '#27ae60',
            fontSize: '16px',
            padding: '12px 24px'
          }}
        >
          {showAI ? '❌ Fechar IA' : '🤖 Abrir Assistente IA'}
        </button>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          {showAI ? 'IA ativa - analisando seus dados' : 'Clique para ativar análise inteligente'}
        </div>
      </div>

      {/* Mostrar IA se ativada */}
      {showAI && (
        <AIDashboard 
          gastosData={gastosData} 
          rendimentosData={{}} // Você pode passar dados de rendimentos aqui se tiver
          currentMonth={currentMonth}
        />
      )}

      {/* Tabs dos meses */}
      <div className="tabs">
        {mesesInfo.map(mes => (
          <button
            key={mes.id}
            className={`tab ${currentMonth === mes.id ? 'active' : ''}`}
            onClick={() => setCurrentMonth(mes.id)}
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
          isActive={currentMonth === mes.id}
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
        currentMonth={currentMonth}
      />
    </div>
  );
}

export default App;
