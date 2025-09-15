import React, { useMemo } from 'react';
import QuickStats from '../QuickStats';
import { formatCurrency } from '../../utils/calculations';
import { RENDIMENTOS_CONFIG, MESES_NOMES } from '../../config/constants';

import { mesesInfo } from '../../data/monthsData';

const OverviewSection = ({
  gastosFixos,
  gastosData,
  rendimentosData,
  loading,
  error,
  connectionStatus,
  totalTransactions,
  clearError,
  reloadData
}) => {
  // Calcular totais para visão geral
  const stats = useMemo(() => {
    let totalGastosVariaveis = 0;
    let totalGastosFixos = 0;
    let totalRendimentos = 0;
    let mesesComDados = 0;

    // Dados detalhados por mês
    const detalhesPorMes = {};

    // Calculate variable expenses
    Object.entries(gastosData).forEach(([mesId, gastos]) => {
      let totalGastosVariaveisMes = 0;
      let totalGastosFixosMes = 0;

      if (gastos && gastos.length > 0) {
        mesesComDados++;
        gastos.forEach(gasto => {
          totalGastosVariaveisMes += gasto.valor;
        });
      }

      // Add fixed expenses for this month
      if (gastosFixos && gastosFixos[mesId]) {
        const mesGastosFixos = gastosFixos[mesId];
        totalGastosFixosMes += Object.values(mesGastosFixos).reduce((total, valor) => total + valor, 0);
      }

      // Calcular total de gastos do mês
      const totalGastosMes = totalGastosVariaveisMes + totalGastosFixosMes;

      // Armazenar detalhes por mês
      detalhesPorMes[mesId] = {
        totalGastos: totalGastosMes,
        totalGastosVariaveis: totalGastosVariaveisMes,
        totalGastosFixos: totalGastosFixosMes
      };

      // Adicionar aos totais gerais
      totalGastosVariaveis += totalGastosVariaveisMes;
      totalGastosFixos += totalGastosFixosMes;
    });

    // Total expenses is the sum of variable and fixed expenses
    const totalGastos = totalGastosVariaveis + totalGastosFixos;

    // Calculate rendimentos based on working days and extra rendimentos
    mesesInfo.forEach(mes => {
      const mesId = mes.id;
      const diasTrabalhados = mes.dias; // Use actual working days from mesesInfo

      // Calculate base rendimentos
      const rendimentoAndre = RENDIMENTOS_CONFIG.SALARIO_ANDRE * diasTrabalhados;
      const ivaAndre = rendimentoAndre * RENDIMENTOS_CONFIG.IVA_RATE;
      const totalAndre = rendimentoAndre + ivaAndre;

      const rendimentoAline = RENDIMENTOS_CONFIG.SALARIO_ALINE * diasTrabalhados;
      const ivaAline = rendimentoAline * RENDIMENTOS_CONFIG.IVA_RATE;
      const totalAline = rendimentoAline + ivaAline;

      // Add to total rendimentos
      totalRendimentos += totalAndre + totalAline;

      // Add extra rendimentos from rendimentosData if available
      if (rendimentosData && rendimentosData[mesId]) {
        const extraRendimentosMes = rendimentosData[mesId];
        const totalExtrasMes = extraRendimentosMes.reduce((sum, r) => sum + (r.valor || 0), 0);
        totalRendimentos += totalExtrasMes;
      }
    });



    const saldoTotal = totalRendimentos - totalGastos;

    return {
      totalGastos,
      totalGastosVariaveis,
      totalGastosFixos,
      totalRendimentos,
      saldoTotal,
      mesesComDados,
      mediaMensalGastos: mesesComDados > 0 ? totalGastos / mesesComDados : 0,
      mediaMensalRendimentos: mesesComDados > 0 ? totalRendimentos / mesesComDados : 0,
      detalhesPorMes
    };
  }, [gastosData, gastosFixos, rendimentosData]);

  if (loading) {
    return (
      <div className="overview-section">
        <div className="section-header">
          <h1>📊 Visão Geral Financeira</h1>
          <p>Carregando dados...</p>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Carregando informações financeiras...</p>
        </div>
      </div>
    );
  }

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
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-label">Variáveis:</span>
                <span className="detail-value">{formatCurrency(stats.totalGastosVariaveis)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fixos:</span>
                <span className="detail-value">{formatCurrency(stats.totalGastosFixos)}</span>
              </div>
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

      {/* Detalhes por mês */}
      <div className="monthly-details">
        <h3>📊 Detalhes por Mês</h3>
        <div className="monthly-grid">
          {Object.entries(stats.detalhesPorMes).map(([mesId, detalhes]) => (
            <div key={mesId} className="monthly-card">
              <div className="monthly-header">
                <h4>{MESES_NOMES[mesId] || mesId}</h4>
              </div>
              <div className="monthly-content">
                <div className="detail-item">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">{formatCurrency(detalhes.totalGastos)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Variáveis:</span>
                  <span className="detail-value">{formatCurrency(detalhes.totalGastosVariaveis)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Fixos:</span>
                  <span className="detail-value">{formatCurrency(detalhes.totalGastosFixos)}</span>
                </div>
              </div>
            </div>
          ))}
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
