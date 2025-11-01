import React, { useState } from 'react';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';
import AnalyticsSection from './DashboardSections/AnalyticsSection.js';
import OverviewSection from './DashboardSections/OverviewSection.js';
import ChartsSection from './DashboardSections/ChartsSection.js';
import ExpensesSection from './DashboardSections/ExpensesSection.js';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Usar o hook do Firestore para obter os dados
  const { 
    gastosData, 
    gastosFixos,
    rendimentosData,
    loading,
    error,
    connectionStatus,
    totalTransactions,
    addGasto,
    removeGasto,
    clearError,
    reloadData
  } = useUnifiedFirestore();

  const menuItems = [
    { id: 'overview', label: '📊 Visão Geral', icon: '📊' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'charts', label: '📊 Gráficos', icon: '📊' },
    { id: 'expenses', label: '💰 Gastos', icon: '💰' },
  ];

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '50px auto' }}></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}>
        <h2>❌ Erro ao carregar dados</h2>
        <p>{error}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewSection
            gastosFixos={gastosFixos}
            gastosData={gastosData}
            rendimentosData={rendimentosData}
            loading={loading}
            error={error}
            connectionStatus={connectionStatus}
            totalTransactions={totalTransactions}
            clearError={clearError}
            reloadData={reloadData}
          />
        );
      case 'analytics':
        return <AnalyticsSection gastosData={gastosData} rendimentosData={rendimentosData} />;
      case 'charts':
        return <ChartsSection gastosData={gastosData} gastosFixos={gastosFixos} />;
      case 'expenses':
        return (
          <ExpensesSection
            gastosData={gastosData}
            addGasto={addGasto}
            removeGasto={removeGasto}
          />
        );
      default:
        return (
          <OverviewSection
            gastosFixos={gastosFixos}
            gastosData={gastosData}
            rendimentosData={rendimentosData}
            loading={loading}
            error={error}
            connectionStatus={connectionStatus}
            totalTransactions={totalTransactions}
            clearError={clearError}
            reloadData={reloadData}
          />
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '20px', 
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>Bem-vindo, {user.displayName || user.email || 'Usuário'}! 👋</h2>
        <p style={{ color: '#666', margin: '5px 0' }}>
          Gerencie suas finanças de forma inteligente
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: activeTab === item.id ? '#3498db' : '#f8f9fa',
              color: activeTab === item.id ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === item.id ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Dashboard;
