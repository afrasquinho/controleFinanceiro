import React, { useEffect, useState } from 'react';
import { mesesInfo } from '../../data/monthsData.js';

const SettingsSection = ({ 
  gastosData, 
  clearError,
  reloadData 
}) => {
  // Preferências da aplicação
  const [currency, setCurrency] = useState('EUR');
  const [locale, setLocale] = useState('pt-PT');
  const [theme, setTheme] = useState('system'); // light | dark | system
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // Carregar preferências
    const savedCurrency = localStorage.getItem('app_currency') || 'EUR';
    const savedLocale = localStorage.getItem('app_locale') || 'pt-PT';
    const savedTheme = localStorage.getItem('app_theme') || 'system';
    const savedBudget = localStorage.getItem('app_monthly_budget') || '';
    const savedNotif = localStorage.getItem('app_notifications_enabled');
    setCurrency(savedCurrency);
    setLocale(savedLocale);
    setTheme(savedTheme);
    setMonthlyBudget(savedBudget);
    setNotificationsEnabled(savedNotif === null ? true : savedNotif === 'true');
  }, []);

  const savePreferences = () => {
    localStorage.setItem('app_currency', currency);
    localStorage.setItem('app_locale', locale);
    localStorage.setItem('app_theme', theme);
    localStorage.setItem('app_monthly_budget', monthlyBudget);
    localStorage.setItem('app_notifications_enabled', String(notificationsEnabled));
  };

  const clearCache = () => {
    try {
      sessionStorage.clear();
      // Opcionalmente não limpar tudo do localStorage para não perder settings
    } catch (e) {}
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h1>⚙️ Configurações e Backup</h1>
        <p>Gerencie suas configurações e dados</p>
      </div>

      {/* Preferências */}
      <div className="settings-card">
        <h3>🧩 Preferências</h3>
        <div className="connection-settings">
          <div className="setting-item">
            <label>Moeda</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="category-select">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="BRL">BRL (R$)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Idioma</label>
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className="category-select">
              <option value="pt-PT">Português (Portugal)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Tema</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="category-select">
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Orçamento Mensal</label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              placeholder="Ex: 1500"
            />
          </div>
          <div className="setting-item">
            <label>Notificações</label>
            <div className="setting-value">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span style={{ marginLeft: 8 }}>{notificationsEnabled ? 'Ativadas' : 'Desativadas'}</span>
            </div>
          </div>
          <div className="setting-actions">
            <button onClick={savePreferences} className="btn btn-primary">💾 Guardar Preferências</button>
          </div>
        </div>
      </div>

      {/* Configurações de Conexão */}
      <div className="settings-card">
        <h3>🔗 Configurações de Conexão</h3>
        <div className="connection-settings">
          <div className="setting-item">
            <label>Status da Conexão Firebase</label>
            <div className="setting-value">
              <span className="status-indicator connected"></span>
              Conectado
            </div>
          </div>
          
          <div className="setting-item">
            <label>Última Atualização</label>
            <div className="setting-value">
              {new Date().toLocaleString('pt-PT')}
            </div>
          </div>

          <div className="setting-actions">
            <button onClick={reloadData} className="btn btn-primary">
              🔄 Atualizar Dados
            </button>
            <button onClick={clearError} className="btn btn-secondary">
              🗑️ Limpar Erros
            </button>
            <button onClick={clearCache} className="btn btn-secondary">
              🧹 Limpar Cache (Sessão)
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="settings-card">
        <h3>📊 Estatísticas do Sistema</h3>
        <div className="system-stats">
          <div className="stat-row">
            <span className="stat-label">Total de Meses:</span>
            <span className="stat-value">{Object.keys(gastosData).length}</span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Total de Transações:</span>
            <span className="stat-value">
              {Object.values(gastosData).reduce((total, gastos) => total + (gastos?.length || 0), 0)}
            </span>
          </div>
          
          <div className="stat-row">
            <span className="stat-label">Meses com Dados:</span>
            <span className="stat-value">
              {mesesInfo.filter(mes => gastosData[mes.id]?.length > 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Informações da Aplicação */}
      <div className="settings-card">
        <h3>ℹ️ Informações da Aplicação</h3>
        <div className="app-info">
          <div className="info-item">
            <strong>Nome:</strong> Controle Financeiro 2025
          </div>
          <div className="info-item">
            <strong>Versão:</strong> 1.0.0
          </div>
          <div className="info-item">
            <strong>Tecnologia:</strong> React + Firebase
          </div>
          <div className="info-item">
            <strong>IA:</strong> Análise Avançada com Machine Learning
          </div>
        </div>
      </div>

      {/* Ações de Desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="settings-card">
          <h3>🐛 Ferramentas de Desenvolvimento</h3>
          <div className="dev-tools">
            <button 
              onClick={() => console.log('Dados:', gastosData)}
              className="btn btn-secondary"
            >
              📋 Log Dados no Console
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-secondary"
            >
              🔄 Recarregar Aplicação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsSection;
