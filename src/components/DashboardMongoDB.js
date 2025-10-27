import React, { useState } from 'react';
import { useGastos, useRendimentos, useAnalytics } from '../hooks/useMongoDB.js';

const DashboardMongoDB = ({ user }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState('jan');
  const [selectedYear, setSelectedYear] = useState(2025);

  // Hooks do MongoDB
  const {
    gastos,
    loading: gastosLoading,
    error: gastosError,
    addGasto,
    updateGasto,
    deleteGasto
  } = useGastos(selectedMonth, selectedYear);

  const {
    rendimentos,
    loading: rendimentosLoading,
    error: rendimentosError,
    addRendimento,
    updateRendimento,
    deleteRendimento
  } = useRendimentos(selectedMonth, selectedYear);

  const {
    dashboard,
    trends,
    categories,
    loading: analyticsLoading,
    error: analyticsError
  } = useAnalytics(selectedMonth, selectedYear);

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'expenses', label: 'Gastos', icon: '💰' },
    { id: 'income', label: 'Rendimentos', icon: '💵' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' }
  ];

  const renderOverview = () => (
    <div className="overview-section">
      <h2>📊 Visão Geral - {selectedMonth}/{selectedYear}</h2>
      
      {dashboard && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>💰 Total Gastos</h3>
            <p className="stat-value">€{dashboard.resumo?.totalGastos?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>💵 Total Rendimentos</h3>
            <p className="stat-value">€{dashboard.resumo?.totalRendimentos?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="stat-card">
            <h3>📊 Saldo</h3>
            <p className={`stat-value ${(dashboard.resumo?.saldo || 0) >= 0 ? 'positive' : 'negative'}`}>
              €{dashboard.resumo?.saldo?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="stat-card">
            <h3>📝 Transações</h3>
            <p className="stat-value">{dashboard.resumo?.totalTransacoes || 0}</p>
          </div>
        </div>
      )}

      <div className="controls">
        <label>
          Mês:
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="jan">Janeiro</option>
            <option value="fev">Fevereiro</option>
            <option value="mar">Março</option>
            <option value="abr">Abril</option>
            <option value="mai">Maio</option>
            <option value="jun">Junho</option>
            <option value="jul">Julho</option>
            <option value="ago">Agosto</option>
            <option value="set">Setembro</option>
            <option value="out">Outubro</option>
            <option value="nov">Novembro</option>
            <option value="dez">Dezembro</option>
          </select>
        </label>
        <label>
          Ano:
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />
        </label>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="expenses-section">
      <h2>💰 Gastos - {selectedMonth}/{selectedYear}</h2>
      
      {gastosLoading && <p>Carregando gastos...</p>}
      {gastosError && <p className="error">Erro: {gastosError}</p>}
      
      {gastos.length === 0 ? (
        <p>Nenhum gasto encontrado para este período.</p>
      ) : (
        <div className="expenses-list">
          {gastos.map((gasto) => (
            <div key={gasto._id} className="expense-item">
              <div className="expense-info">
                <h4>{gasto.descricao}</h4>
                <p>{gasto.categoria} • {new Date(gasto.data).toLocaleDateString('pt-PT')}</p>
              </div>
              <div className="expense-actions">
                <span className="expense-value">€{gasto.valor.toFixed(2)}</span>
                <button onClick={() => deleteGasto(gasto._id)} className="delete-btn">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderIncome = () => (
    <div className="income-section">
      <h2>💵 Rendimentos - {selectedMonth}/{selectedYear}</h2>
      
      {rendimentosLoading && <p>Carregando rendimentos...</p>}
      {rendimentosError && <p className="error">Erro: {rendimentosError}</p>}
      
      {rendimentos.length === 0 ? (
        <p>Nenhum rendimento encontrado para este período.</p>
      ) : (
        <div className="income-list">
          {rendimentos.map((rendimento) => (
            <div key={rendimento._id} className="income-item">
              <div className="income-info">
                <h4>{rendimento.fonte}</h4>
                <p>{rendimento.tipo} • {new Date(rendimento.data).toLocaleDateString('pt-PT')}</p>
              </div>
              <div className="income-actions">
                <span className="income-value">€{rendimento.valor.toFixed(2)}</span>
                <button onClick={() => deleteRendimento(rendimento._id)} className="delete-btn">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="analytics-section">
      <h2>📈 Analytics - {selectedMonth}/{selectedYear}</h2>
      
      {analyticsLoading && <p>Carregando analytics...</p>}
      {analyticsError && <p className="error">Erro: {analyticsError}</p>}
      
      {categories && (
        <div className="analytics-content">
          <h3>Gastos por Categoria</h3>
          <div className="categories-list">
            {categories.categorias?.map((cat) => (
              <div key={cat._id} className="category-item">
                <div className="category-info">
                  <h4>{cat._id}</h4>
                  <p>{cat.count} transações</p>
                </div>
                <div className="category-stats">
                  <span className="category-total">€{cat.total.toFixed(2)}</span>
                  <span className="category-percentage">{cat.percentual}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="settings-section">
      <h2>⚙️ Configurações</h2>
      <div className="settings-content">
        <div className="user-info">
          <h3>Informações do Usuário</h3>
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Último Login:</strong> {new Date(user.lastLogin).toLocaleDateString('pt-PT')}</p>
        </div>
        
        <div className="database-info">
          <h3>Informações do Banco de Dados</h3>
          <p><strong>Banco:</strong> MongoDB Atlas</p>
          <p><strong>Status:</strong> Conectado ✅</p>
          <p><strong>Total Gastos:</strong> {gastos.length}</p>
          <p><strong>Total Rendimentos:</strong> {rendimentos.length}</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'expenses':
        return renderExpenses();
      case 'income':
        return renderIncome();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>🍃 MongoDB Dashboard</h2>
          <p>Bem-vindo, {user.name}!</p>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardMongoDB;
