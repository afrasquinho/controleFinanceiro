import React from 'react';
import DownloadSection from '../DownloadSection.js';
import { mesesInfo } from '../../data/monthsData.js';

const SettingsSection = ({ 
  gastosData, 
  clearError,
  reloadData 
}) => {
  return (
    <div className="settings-section">
      <div className="section-header">
        <h1>⚙️ Configurações e Backup</h1>
        <p>Gerencie suas configurações e dados</p>
      </div>

      {/* Backup e Restauração */}
      <div className="settings-card">
        <h3>📦 Backup e Restauração</h3>
        <DownloadSection
          gastosData={gastosData}
          onExportData={() => {
            console.log('Função exportData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          onImportData={() => {
            console.log('Função importData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          onClearAllData={() => {
            console.log('Função clearAllData será implementada em breve');
            // Temporariamente desabilitado - será implementado no próximo passo
          }}
          currentMonth="jan"
        />
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
              {new Date().toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="setting-actions">
            <button onClick={reloadData} className="btn btn-primary">
              🔄 Atualizar Dados
            </button>
            <button onClick={clearError} className="btn btn-secondary">
              🗑️ Limpar Erros
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
