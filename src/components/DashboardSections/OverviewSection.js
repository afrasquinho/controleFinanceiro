import React from 'react';
import QuickStats from '../QuickStats';
import { formatCurrency } from '../../utils/calculations';

const OverviewSection = ({
  gastosFixos, 
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

    console.log('gastosData:', gastosData); // Log the contents of gastosData
    Object.values(gastosData).forEach(gastos => {
      if (gastos && gastos.length > 0) {
        mesesComDados++;
        gastos.forEach(gasto => {
          // All entries in gastosData are expenses, so we sum them all
          totalGastos += gasto.valor;
        });
      }
    });

    // Calculate rendimentos based on working days and extra rendimentos
    // This is a simplified calculation - in a real app, you'd get this from the Firestore hook
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    meses.forEach(mesId => {
      // Get working days for this month (simplified - in real app, get from Firestore)
      const diasTrabalhados = { andre: 22, aline: 22 }; // Default values
      
      // Calculate base rendimentos
      const rendimentoAndre = 144 * diasTrabalhados.andre;
      const ivaAndre = rendimentoAndre * 0.23;
      const totalAndre = rendimentoAndre + ivaAndre;
      
      const rendimentoAline = 160 * diasTrabalhados.aline;
      const ivaAline = rendimentoAline * 0.23;
      const totalAline = rendimentoAline + ivaAline;
      
      // Add to total rendimentos
      totalRendimentos += totalAndre + totalAline;
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
