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
            gastosFixos={gastosFixos}
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
    <div className="dashboard-container" style={{ display: 'flex', gap: 20 }}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ width: 220, minWidth: 200 }}>
        <div className="sidebar-header" style={{
          backgroundColor: '#fff',
          padding: '16px 18px',
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          marginBottom: 12
        }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>📊 Dashboard</h2>
          <p style={{ margin: '6px 0 0', color: '#667085', fontSize: 13 }}>
            {user.displayName || user.email || 'Usuário'}
          </p>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Navegação do dashboard" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
              aria-label={`Ir para ${item.label.replace(/^[^\s]+\s/, '')}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: activeTab === item.id ? '#eff6ff' : '#ffffff',
                color: '#111827',
                cursor: 'pointer'
              }}
            >
              <span className="nav-icon" style={{ minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
              <span className="nav-label" style={{ fontSize: 14 }}>{item.label.replace(/^[^\s]+\s/, '')}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main" style={{ flex: 1 }}>
        <div style={{
          backgroundColor: '#fff',
          padding: 20,
          marginBottom: 20,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ margin: 0 }}>Bem-vindo, {user.displayName || user.email || 'Usuário'}! 👋</h2>
          <p style={{ color: '#666', margin: '6px 0 0' }}>Gerencie suas finanças de forma inteligente</p>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
