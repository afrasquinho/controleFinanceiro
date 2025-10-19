import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';
import CurrencyResearchSection from './CurrencyResearchSection.js';

const SavingsSection = ({ gastosData, rendimentosData }) => {
  const [savingsGoal, setSavingsGoal] = useState({
    target: 50000, // Meta de entrada para casa
    deadline: 24, // Meses
    current: 0
  });

  const [investmentTips, setInvestmentTips] = useState([]);

  // Calcular estatísticas de poupança
  const savingsStats = useMemo(() => {
    // Calcular total de rendimentos
    let totalRendimentos = 0;
    if (rendimentosData && typeof rendimentosData === 'object') {
      totalRendimentos = Object.values(rendimentosData).reduce((sum, rend) => {
        return sum + (typeof rend === 'object' && rend.valor ? rend.valor : 0);
      }, 0);
    }
    
    // Calcular total de gastos
    let totalGastos = 0;
    if (gastosData && typeof gastosData === 'object') {
      totalGastos = Object.values(gastosData).flat().reduce((sum, gasto) => {
        return sum + (typeof gasto === 'object' && gasto.valor ? gasto.valor : 0);
      }, 0);
    }
    
    const currentSavings = Math.max(0, totalRendimentos - totalGastos);
    
    // Calcular médias mensais
    const monthsCount = Math.max(1, Object.keys(gastosData || {}).length);
    const monthlyIncome = totalRendimentos / monthsCount;
    const monthlyExpenses = totalGastos / monthsCount;
    const monthlySavings = monthlyIncome - monthlyExpenses;
    
    // Calcular meses para atingir a meta
    const remainingAmount = Math.max(0, savingsGoal.target - currentSavings);
    const monthsToGoal = monthlySavings > 0 
      ? Math.ceil(remainingAmount / monthlySavings)
      : (remainingAmount > 0 ? 999 : 0); // Se não há poupança mensal, nunca atingirá

    const progressPercentage = savingsGoal.target > 0 
      ? Math.min((currentSavings / savingsGoal.target) * 100, 100)
      : 0;

    return {
      currentSavings,
      monthlySavings,
      monthsToGoal,
      progressPercentage,
      monthlyIncome,
      monthlyExpenses
    };
  }, [gastosData, rendimentosData, savingsGoal.target]);

  // Dicas de investimentos de retorno rápido
  useEffect(() => {
    const tips = [
      {
        id: 1,
        title: "🏦 Certificados de Aforro",
        description: "Rendimento seguro e garantido pelo Estado",
        return: "3.5% ao ano",
        risk: "Baixo",
        liquidity: "Alta",
        minAmount: "100€",
        tip: "Ideal para começar a poupar com segurança"
      },
      {
        id: 2,
        title: "💼 ETFs de Mercados Emergentes",
        description: "Diversificação em mercados em crescimento",
        return: "8-12% ao ano",
        risk: "Médio",
        liquidity: "Alta",
        minAmount: "50€",
        tip: "Boa opção para médio prazo (2-3 anos)"
      },
      {
        id: 3,
        title: "🏠 PPR (Plano Poupança Reforma)",
        description: "Benefícios fiscais e rendimento atrativo",
        return: "4-6% ao ano",
        risk: "Baixo-Médio",
        liquidity: "Média",
        minAmount: "25€/mês",
        tip: "Pode resgatar para entrada de casa após 5 anos"
      },
      {
        id: 4,
        title: "📈 Ações Dividendos",
        description: "Empresas sólidas com dividendos regulares",
        return: "6-10% ao ano",
        risk: "Médio",
        liquidity: "Alta",
        minAmount: "100€",
        tip: "Foque em empresas estáveis como EDP, Galp"
      },
      {
        id: 5,
        title: "💰 Conta Poupança Online",
        description: "Bancos digitais com taxas mais altas",
        return: "2-4% ao ano",
        risk: "Muito Baixo",
        liquidity: "Muito Alta",
        minAmount: "1€",
        tip: "Compare taxas entre bancos digitais"
      },
      {
        id: 6,
        title: "🎯 Fundos de Investimento",
        description: "Gestão profissional diversificada",
        return: "5-8% ao ano",
        risk: "Médio",
        liquidity: "Alta",
        minAmount: "50€",
        tip: "Escolha fundos com baixas comissões"
      }
    ];
    setInvestmentTips(tips);
  }, []);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Muito Baixo': return '#10b981';
      case 'Baixo': return '#34d399';
      case 'Baixo-Médio': return '#fbbf24';
      case 'Médio': return '#f59e0b';
      case 'Alto': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getLiquidityIcon = (liquidity) => {
    switch (liquidity) {
      case 'Muito Alta': return '💧';
      case 'Alta': return '🌊';
      case 'Média': return '🏔️';
      case 'Baixa': return '🗻';
      default: return '❓';
    }
  };

  return (
    <div className="savings-section">
      <div className="section-header">
        <h1>🏠 Poupança para Entrada de Casa</h1>
        <p>Metas, progresso e dicas de investimento para alcançar o seu objetivo</p>
      </div>

      {/* Meta de Poupança */}
      <div className="savings-goal-card">
        <div className="goal-header">
          <h3>🎯 Sua Meta</h3>
          <div className="goal-amount">
            <span className="target">{formatCurrency(savingsGoal.target)}</span>
            <span className="label">para entrada de casa</span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${savingsStats.progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            <span>{formatCurrency(savingsStats.currentSavings)}</span>
            <span>{savingsStats.progressPercentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="goal-stats">
          <div className="stat-item">
            <span className="stat-label">Poupança Atual</span>
            <span className="stat-value positive">{formatCurrency(savingsStats.currentSavings)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Poupança Mensal</span>
            <span className="stat-value">{formatCurrency(savingsStats.monthlySavings)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Meses para Meta</span>
            <span className="stat-value">{savingsStats.monthsToGoal}</span>
          </div>
        </div>
      </div>

      {/* Calculadora de Poupança */}
      <div className="savings-calculator">
        <h3>🧮 Calculadora de Poupança</h3>
        <div className="calculator-content">
          <div className="input-group">
            <label>Meta de Entrada:</label>
            <input
              type="number"
              value={savingsGoal.target}
              onChange={(e) => setSavingsGoal(prev => ({ ...prev, target: Number(e.target.value) || 0 }))}
              placeholder="50000"
              min="0"
            />
          </div>
          <div className="input-group">
            <label>Prazo (meses):</label>
            <input
              type="number"
              value={savingsGoal.deadline}
              onChange={(e) => setSavingsGoal(prev => ({ ...prev, deadline: Number(e.target.value) || 0 }))}
              placeholder="24"
              min="1"
            />
          </div>
          <div className="calculation-result">
            <h4>Para atingir sua meta, você precisa poupar:</h4>
            <div className="monthly-target">
              {savingsGoal.deadline > 0 && savingsGoal.target > 0
                ? formatCurrency(Math.max(0, (savingsGoal.target - savingsStats.currentSavings) / savingsGoal.deadline))
                : formatCurrency(0)
              }
              <span>/mês</span>
            </div>
            {savingsGoal.deadline > 0 && savingsGoal.target > 0 && (
              <div className="calculation-details">
                <p><strong>Meta:</strong> {formatCurrency(savingsGoal.target)}</p>
                <p><strong>Poupança Atual:</strong> {formatCurrency(savingsStats.currentSavings)}</p>
                <p><strong>Faltam:</strong> {formatCurrency(Math.max(0, savingsGoal.target - savingsStats.currentSavings))}</p>
                <p><strong>Prazo:</strong> {savingsGoal.deadline} meses</p>
                <p><strong>Poupança Mensal Atual:</strong> {formatCurrency(savingsStats.monthlySavings)}</p>
                <p><strong>Necessário:</strong> {formatCurrency(Math.max(0, (savingsGoal.target - savingsStats.currentSavings) / savingsGoal.deadline))}/mês</p>
                {savingsStats.monthlySavings > 0 && (
                  <p><strong>Tempo Real:</strong> {Math.ceil(Math.max(0, savingsGoal.target - savingsStats.currentSavings) / savingsStats.monthlySavings)} meses</p>
                )}
              </div>
            )}
            {savingsGoal.deadline === 0 && (
              <div className="calculation-warning">
                <p>⚠️ Defina um prazo válido para ver os cálculos</p>
              </div>
            )}
            {savingsGoal.target === 0 && (
              <div className="calculation-warning">
                <p>⚠️ Defina uma meta válida para ver os cálculos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dicas de Investimentos */}
      <div className="investment-tips">
        <h3>💡 Dicas de Investimentos de Retorno Rápido</h3>
        <div className="tips-grid">
          {investmentTips.map(tip => (
            <div key={tip.id} className="tip-card">
              <div className="tip-header">
                <h4>{tip.title}</h4>
                <div className="tip-return">{tip.return}</div>
              </div>
              <p className="tip-description">{tip.description}</p>
              <div className="tip-details">
                <div className="detail-item">
                  <span className="label">Risco:</span>
                  <span className="value" style={{ color: getRiskColor(tip.risk) }}>
                    {tip.risk}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Liquidez:</span>
                  <span className="value">
                    {getLiquidityIcon(tip.liquidity)} {tip.liquidity}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Mínimo:</span>
                  <span className="value">{tip.minAmount}</span>
                </div>
              </div>
              <div className="tip-advice">
                <strong>💡 Dica:</strong> {tip.tip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estratégia Recomendada */}
      <div className="recommended-strategy">
        <h3>🎯 Estratégia Recomendada para Você</h3>
        <div className="strategy-content">
          <div className="strategy-phase">
            <h4>📅 Fase 1: Fundação (Primeiros 6 meses)</h4>
            <ul>
              <li>🏦 <strong>Certificados de Aforro</strong> - 60% do valor poupado</li>
              <li>💰 <strong>Conta Poupança Online</strong> - 40% do valor poupado</li>
              <li>Objetivo: Construir base sólida e segura</li>
            </ul>
          </div>
          <div className="strategy-phase">
            <h4>📈 Fase 2: Crescimento (6-18 meses)</h4>
            <ul>
              <li>💼 <strong>ETFs Diversificados</strong> - 40% do valor poupado</li>
              <li>🏦 <strong>Certificados de Aforro</strong> - 40% do valor poupado</li>
              <li>📈 <strong>Ações Dividendos</strong> - 20% do valor poupado</li>
              <li>Objetivo: Aumentar retorno mantendo segurança</li>
            </ul>
          </div>
          <div className="strategy-phase">
            <h4>🏠 Fase 3: Finalização (18+ meses)</h4>
            <ul>
              <li>🏦 <strong>Certificados de Aforro</strong> - 70% do valor poupado</li>
              <li>💰 <strong>Conta Poupança</strong> - 30% do valor poupado</li>
              <li>Objetivo: Preservar capital para entrada</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pesquisa de Moedas */}
      <div className="currency-research-section">
        <CurrencyResearchSection />
      </div>
    </div>
  );
};

export default SavingsSection;
