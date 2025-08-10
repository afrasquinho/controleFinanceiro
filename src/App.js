
import React, { useState } from 'react';
import { mesesInfo } from './data/monthsData';
import { useFinanceData } from './hooks/useFinanceData';
import MonthContent from './components/MonthContent';
import DownloadSection from './components/DownloadSection';
import './App.css';

function App() {
  const [currentMonth, setCurrentMonth] = useState('jan');
  
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

  const showMonth = (monthId) => {
    setCurrentMonth(monthId);
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          fontSize: '18px',
          color: '#666'
        }}>
          <div>🔄 Carregando dados...</div>
          <div style={{ fontSize: '14px', marginTop: '10px' }}>
            Conectando ao Firebase
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: '#e74c3c'
        }}>
          <h2>❌ Erro ao carregar dados</h2>
          <p>{error}</p>
          <button 
            className="btn" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px' }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>💰 Controle Financeiro 2025</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Sistema completo de gestão financeira pessoal
        </p>
      </header>
      
      {/* Navegação por abas */}
      <nav className="tabs">
        {mesesInfo.map(mes => (
          <button 
            key={mes.id}
            className={`tab ${currentMonth === mes.id ? 'active' : ''}`}
            onClick={() => showMonth(mes.id)}
            title={`${mes.nome} - ${mes.dias} dias úteis`}
          >
            {mes.nome}
          </button>
        ))}
      </nav>

      {/* Conteúdo dos meses */}
      <main>
        {mesesInfo.map(mes => (
          <MonthContent 
            key={mes.id}
            mes={mes}
            isActive={currentMonth === mes.id}
            gastos={gastosData[mes.id] || []}
            onAddGasto={addGasto}
            onRemoveGasto={removeGasto}
          />
        ))}
      </main>

      {/* Seção de downloads e opções */}
      <footer>
        <DownloadSection 
          gastosData={gastosData}
          onExportData={exportData}
          onImportData={importData}
          onClearAllData={clearAllData}
          currentMonth={currentMonth}
        />
      </footer>
    </div>
  );
}

export default App;
