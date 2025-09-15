import React, { useState } from 'react';
import OverviewSection from './DashboardSections/OverviewSection';
import MonthsSection from './MonthsSection';
import ExpensesSection from './DashboardSections/ExpensesSection';
import PredictionsSection from './DashboardSections/PredictionsSection';
import AnalyticsSection from './DashboardSections/AnalyticsSection';
import SettingsSection from './DashboardSections/SettingsSection';
import TestRendimentos from './TestRendimentos'; // Import the test component
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  
  // Hook do Firestore com recursos aprimorados
  const { 
    gastosData, 
    gastosFixos,
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
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>💰 Controle Financeiro</h2>
          <div className="connection-status-indicator">
            <div className={`status-dot ${connectionStatus}`}></div>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'Conectado' : 
               connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
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
        <MonthsSection gastosData={gastosData} />
        {activeSection === 'overview' && <TestRendimentos />}
        {ActiveComponent && activeSection !== 'overview' && (
          <ActiveComponent
            gastosData={gastosData}
            gastosFixos={gastosFixos}
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
  );
};

export default Dashboard;
