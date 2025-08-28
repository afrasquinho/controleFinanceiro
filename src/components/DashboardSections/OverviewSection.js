import React from 'react';
import QuickStats from '../QuickStats';
import { formatCurrency } from '../../utils/calculations';

const OverviewSection = ({ 
  gastosData, 
  loading, 
  error, 
  connectionStatus,
  totalTransactions,
  clearError,
  reloadData
}) => {
  // Calcular totais para visão geral
  const calculateOverviewStats = () => {
    let totalGastos = 0;
    let totalRendimentos = 0;
    let mesesComDados = 0;

    Object.values(gastosData).forEach(gastos => {
      if (gastos && gastos.length > 0) {
        mesesComDados++;
        gastos.forEach(gasto => {
          if (gasto.tipo === 'rendimento') {
            totalRendimentos += gasto.valor;
          } else {
            totalGastos += gasto.valor;
          }
        });
      }
    });

    const saldoTotal = totalRendimentos - totalGastos;

    return {
      totalGastos,
      totalRendimentos,
      saldoTotal,
      mesesComDados,
      mediaMensalGastos: mesesComDados > 0 ? totalGastos / mesesComDados : 0,
      mediaMensalRendimentos: mesesComDados > 0 ? totalRendimentos / mesesComDados : 0
    };
  };

  const stats = calculateOverviewStats();

  return (
    <div className="overview-section">
      {/* Header */}
      <div className="section-header">
        <h1>📊 Visão Geral Financeira</h1>
        <p>Análise completa do seu controle financeiro</p>
      </div>

      {/* Quick Stats */}
      <QuickStats gastosData={gastosData} />

      {/* Overview Cards */}
      <div className="overview-grid">
        <div className="overview-card income-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total de Rendimentos</h3>
            <div className="card-value">{formatCurrency(stats.totalRendimentos)}</div>
            <div className="card-subtext">
              {stats.mesesComDados} meses • Média: {formatCurrency(stats.mediaMensalRendimentos)}
            </div>
          </div>
        </div>

        <div className="overview-card expenses-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total de Gastos</h3>
            <div className="card-value">{formatCurrency(stats.totalGastos)}</div>
            <div className="card-subtext">
              {stats.mesesComDados} meses • Média: {formatCurrency(stats.mediaMensalGastos)}
            </div>
          </div>
        </div>

        <div className="overview-card balance-card">
          <div className="card-icon">⚖️</div>
          <div className="card-content">
            <h3>Saldo Total</h3>
            <div className={`card-value ${stats.saldoTotal >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(stats.saldoTotal)}
            </div>
            <div className="card-subtext">
              {stats.saldoTotal >= 0 ? 'Superavit' : 'Déficit'} acumulado
            </div>
          </div>
        </div>

        <div className="overview-card months-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>Meses Ativos</h3>
            <div className="card-value">{stats.mesesComDados}</div>
            <div className="card-subtext">
              {totalTransactions} transações registradas
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>📋 Atividade Recente</h3>
        <div className="activity-list">
          {Object.entries(gastosData).slice(0, 5).map(([mesId, gastos]) => (
            gastos && gastos.length > 0 && (
              <div key={mesId} className="activity-item">
                <div className="activity-month">{mesId.toUpperCase()}</div>
                <div className="activity-details">
                  {gastos.length} transações • Última: {gastos[gastos.length - 1].descricao}
                </div>
                <div className="activity-amount">
                  {formatCurrency(gastos.reduce((sum, g) => sum + g.valor, 0))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <div className="connection-banner">
          <div className="banner-content">
            <span className="banner-icon">🔗</span>
            <span className="banner-text">
              {connectionStatus === 'connecting' ? 'Conectando ao Firebase...' : 'Erro de conexão'}
            </span>
            {connectionStatus === 'error' && (
              <button onClick={reloadData} className="retry-btn">
                Tentar Novamente
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;
