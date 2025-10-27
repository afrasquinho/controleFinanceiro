import React, { useState } from 'react';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';
import AnalyticsSection from './DashboardSections/AnalyticsSection.js';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Usar o hook do Firestore para obter os dados
  const { 
    gastosData, 
    rendimentosData,
    loading,
    error
  } = useUnifiedFirestore();

  const menuItems = [
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'overview', label: '📊 Visão Geral', icon: '📊' },
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
      case 'analytics':
        return <AnalyticsSection gastosData={gastosData} rendimentosData={rendimentosData} />;
      case 'overview':
        return (
          <div style={{ padding: '20px' }}>
            <h2>📊 Visão Geral</h2>
            <p>Implementação em desenvolvimento...</p>
          </div>
        );
      case 'charts':
        return (
          <div style={{ padding: '20px' }}>
            <h2>📊 Gráficos</h2>
            <p>Implementação em desenvolvimento...</p>
          </div>
        );
      case 'expenses':
        return (
          <div style={{ padding: '20px' }}>
            <h2>💰 Gastos</h2>
            <p>Implementação em desenvolvimento...</p>
          </div>
        );
      default:
        return <AnalyticsSection gastosData={gastosData} rendimentosData={rendimentosData} />;
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
