import React, { useState } from 'react';
import OverviewSection from './DashboardSections/OverviewSection.js';
import MonthsSection from './MonthsSection.js';
import ExpensesSection from './DashboardSections/ExpensesSection.js';
import PredictionsSection from './DashboardSections/PredictionsSection.js';
import AnalyticsSection from './DashboardSections/AnalyticsSection.js';
import SettingsSection from './DashboardSections/SettingsSection.js';
import QuickStats from './QuickStats.js';
import ThemeToggle from './ThemeToggle.js';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Hook do Firestore com recursos aprimorados
  const {
    gastosData,
    gastosFixos,
    rendimentosData,
    loading,
    error,
    connectionStatus,
    totalTransactions,
    clearError,
    reloadData,
    addGasto,
    removeGasto
  } = useUnifiedFirestore();

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: '📊', component: OverviewSection },
    { id: 'expenses', label: 'Gastos', icon: '💰', component: ExpensesSection },
    { id: 'predictions', label: 'Previsões', icon: '🔮', component: PredictionsSection },
    { id: 'analytics', label: 'Análises', icon: '📈', component: AnalyticsSection },
    { id: 'settings', label: 'Configurações', icon: '⚙️', component: SettingsSection }
  ];

  // Keyboard navigation handler
  const handleKeyDown = (e, itemId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveSection(itemId);
    }
  };

  // Navigate with arrow keys
  const handleSidebarKeyDown = (e) => {
    const currentIndex = menuItems.findIndex(item => item.id === activeSection);
    let newIndex = currentIndex;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      newIndex = Math.min(currentIndex + 1, menuItems.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      setActiveSection(menuItems[newIndex].id);
    }
  };

  const ActiveComponent = menuItems.find(item => item.id === activeSection)?.component;

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">💰 Controle Financeiro 2025</h1>
        <div className="app-subtitle">
          <span>🤖 Powered by IA Avançada</span>
          <span>📅 {Object.keys(gastosData).length} meses ativos</span>
          <span>📝 {totalTransactions} transações</span>
          <ThemeToggle size="small" />
        </div>
      </header>
      
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <div className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Dashboard</h2>
            <div className="header-controls">
              <div className="connection-status-indicator">
                <div className={`status-dot ${connectionStatus}`}></div>
                <span className="status-text">
                  {connectionStatus === 'connected' ? 'Conectado' : 
                   connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        
        <nav className="sidebar-nav" onKeyDown={handleSidebarKeyDown} role="navigation" aria-label="Navegação principal">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              tabIndex={activeSection === item.id ? 0 : -1}
              role="tab"
              aria-selected={activeSection === item.id}
              aria-controls={`panel-${item.id}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Stats in Sidebar */}
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-label">Meses</span>
            <span className="stat-value">{Object.keys(gastosData).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Transações</span>
            <span className="stat-value">{totalTransactions}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <>
            <QuickStats gastosData={gastosData} />
            <MonthsSection gastosData={gastosData} />
            <OverviewSection
              gastosData={gastosData}
              gastosFixos={gastosFixos}
              rendimentosData={rendimentosData}
              loading={loading}
              error={error}
              connectionStatus={connectionStatus}
              totalTransactions={totalTransactions}
              clearError={clearError}
              reloadData={reloadData}
            />
          </>
        )}
        {ActiveComponent && activeSection !== 'overview' && (
          <ActiveComponent
            gastosData={gastosData}
            gastosFixos={gastosFixos}
            rendimentosData={rendimentosData}
            loading={loading}
            error={error}
            connectionStatus={connectionStatus}
            totalTransactions={totalTransactions}
            clearError={clearError}
            reloadData={reloadData}
            addGasto={addGasto}
            removeGasto={removeGasto}
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
