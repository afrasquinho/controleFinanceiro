import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const BudgetSection = ({ gastosData, gastosFixos }) => {
  const [budgets, setBudgets] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [showAlertSettings, setShowAlertSettings] = useState(false);

  // Categorias padrão
  const categorias = useMemo(() => ({
    'alimentacao': { nome: '🍽️ Alimentação', cor: '#ff6b6b', icon: '🍽️' },
    'transporte': { nome: '🚗 Transporte', cor: '#4ecdc4', icon: '🚗' },
    'saude': { nome: '🏥 Saúde', cor: '#45b7d1', icon: '🏥' },
    'educacao': { nome: '📚 Educação', cor: '#96ceb4', icon: '📚' },
    'lazer': { nome: '🎬 Lazer', cor: '#feca57', icon: '🎬' },
    'casa': { nome: '🏠 Casa', cor: '#ff9ff3', icon: '🏠' },
    'vestuario': { nome: '👕 Vestuário', cor: '#54a0ff', icon: '👕' },
    'outros': { nome: '📦 Outros', cor: '#5f27cd', icon: '📦' }
  }), []);

  // Carregar orçamentos salvos
  useEffect(() => {
    const savedBudgets = localStorage.getItem('category_budgets');
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // Salvar orçamentos
  const saveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    localStorage.setItem('category_budgets', JSON.stringify(newBudgets));
  };

  // Calcular gastos atuais por categoria
  const gastosAtuais = useMemo(() => {
    const gastos = {};
    const mesAtual = new Date().getMonth() + 1;
    const mesId = mesAtual.toString().padStart(2, '0');
    
    // Gastos variáveis
    if (gastosData && gastosData[mesId]) {
      gastosData[mesId].forEach(gasto => {
        const categoria = gasto.categoria || 'outros';
        if (!gastos[categoria]) gastos[categoria] = 0;
        gastos[categoria] += gasto.valor;
      });
    }

    // Gastos fixos (assumindo que são da categoria 'casa')
    if (gastosFixos && gastosFixos[mesId]) {
      const totalFixos = Object.values(gastosFixos[mesId]).reduce((sum, valor) => sum + valor, 0);
      gastos.casa = (gastos.casa || 0) + totalFixos;
    }

    return gastos;
  }, [gastosData, gastosFixos]);

  // Verificar alertas de orçamento
  useEffect(() => {
    const newAlerts = [];
    
    Object.entries(budgets).forEach(([categoria, orcamento]) => {
      const gastoAtual = gastosAtuais[categoria] || 0;
      const percentual = orcamento > 0 ? (gastoAtual / orcamento) * 100 : 0;
      
      if (percentual >= 100) {
        newAlerts.push({
          id: `budget-exceeded-${categoria}`,
          tipo: 'error',
          categoria,
          titulo: `🚨 Orçamento Excedido`,
          mensagem: `${categorias[categoria]?.nome} excedeu o orçamento em ${formatCurrency(gastoAtual - orcamento)}`,
          percentual: percentual.toFixed(1)
        });
      } else if (percentual >= 80) {
        newAlerts.push({
          id: `budget-warning-${categoria}`,
          tipo: 'warning',
          categoria,
          titulo: `⚠️ Aproximando do Limite`,
          mensagem: `${categorias[categoria]?.nome} já gastou ${percentual.toFixed(1)}% do orçamento`,
          percentual: percentual.toFixed(1)
        });
      }
    });

    setAlerts(newAlerts);
  }, [budgets, gastosAtuais, categorias]);

  // Atualizar orçamento
  const updateBudget = (categoria, valor) => {
    const newBudgets = { ...budgets };
    if (valor > 0) {
      newBudgets[categoria] = valor;
    } else {
      delete newBudgets[categoria];
    }
    saveBudgets(newBudgets);
  };

  // Obter cor do progresso
  const getProgressColor = (percentual) => {
    if (percentual >= 100) return '#ef4444';
    if (percentual >= 80) return '#f59e0b';
    if (percentual >= 60) return '#3b82f6';
    return '#10b981';
  };

  // Obter ícone do progresso
  const getProgressIcon = (percentual) => {
    if (percentual >= 100) return '🚨';
    if (percentual >= 80) return '⚠️';
    if (percentual >= 60) return '📊';
    return '✅';
  };

  return (
    <div className="budget-section">
      <div className="section-header">
        <h1>💰 Orçamentos por Categoria</h1>
        <p>Defina limites de gastos e receba alertas inteligentes</p>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAlertSettings(!showAlertSettings)}
          >
            {showAlertSettings ? 'Ocultar' : 'Configurar'} Alertas
          </button>
        </div>
      </div>

      {/* Configurações de Alertas */}
      {showAlertSettings && (
        <div className="alert-settings">
          <h3>🔔 Configurações de Alertas</h3>
          <div className="alert-config">
            <div className="config-item">
              <label>Alertas por Email:</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="config-item">
              <label>Notificações Push:</label>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="config-item">
              <label>Frequência de Verificação:</label>
              <select>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Alertas Ativos */}
      {alerts.length > 0 && (
        <div className="budget-alerts">
          <h3>🚨 Alertas de Orçamento</h3>
          <div className="alerts-grid">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.tipo}`}>
                <div className="alert-icon">{alert.titulo.split(' ')[0]}</div>
                <div className="alert-content">
                  <h4>{alert.titulo}</h4>
                  <p>{alert.mensagem}</p>
                  <div className="alert-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min(alert.percentual, 100)}%`,
                          backgroundColor: getProgressColor(alert.percentual)
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">{alert.percentual}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orçamentos por Categoria */}
      <div className="budgets-grid">
        {Object.entries(categorias).map(([categoriaId, categoria]) => {
          const orcamento = budgets[categoriaId] || 0;
          const gastoAtual = gastosAtuais[categoriaId] || 0;
          const percentual = orcamento > 0 ? (gastoAtual / orcamento) * 100 : 0;
          const restante = Math.max(0, orcamento - gastoAtual);

          return (
            <div key={categoriaId} className="budget-card">
              <div className="budget-header">
                <div className="category-info">
                  <span className="category-icon" style={{ color: categoria.cor }}>
                    {categoria.icon}
                  </span>
                  <h3>{categoria.nome}</h3>
                </div>
                <div className="budget-status">
                  <span className={`status-icon ${getProgressIcon(percentual)}`}>
                    {getProgressIcon(percentual)}
                  </span>
                </div>
              </div>

              <div className="budget-content">
                <div className="budget-input">
                  <label>Orçamento Mensal:</label>
                  <div className="input-group">
                    <input
                      type="number"
                      value={orcamento || ''}
                      onChange={(e) => updateBudget(categoriaId, Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                    <span className="currency">€</span>
                  </div>
                </div>

                <div className="budget-stats">
                  <div className="stat-row">
                    <span className="label">Gasto Atual:</span>
                    <span className="value">{formatCurrency(gastoAtual)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Restante:</span>
                    <span className={`value ${restante === 0 ? 'exceeded' : ''}`}>
                      {formatCurrency(restante)}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="label">Progresso:</span>
                    <span className="value">{percentual.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min(percentual, 100)}%`,
                        backgroundColor: getProgressColor(percentual)
                      }}
                    ></div>
                  </div>
                  <div className="progress-labels">
                    <span>0€</span>
                    <span>{formatCurrency(orcamento)}</span>
                  </div>
                </div>

                {orcamento > 0 && (
                  <div className="budget-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => updateBudget(categoriaId, orcamento * 1.1)}
                    >
                      +10%
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => updateBudget(categoriaId, orcamento * 0.9)}
                    >
                      -10%
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => updateBudget(categoriaId, 0)}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo Geral */}
      <div className="budget-summary">
        <h3>📊 Resumo dos Orçamentos</h3>
        <div className="summary-stats">
          <div className="summary-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h4>Total Orçado</h4>
              <p>{formatCurrency(Object.values(budgets).reduce((sum, val) => sum + val, 0))}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h4>Total Gasto</h4>
              <p>{formatCurrency(Object.values(gastosAtuais).reduce((sum, val) => sum + val, 0))}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <h4>Categorias Ativas</h4>
              <p>{Object.keys(budgets).length}</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-icon">⚠️</div>
            <div className="card-content">
              <h4>Alertas Ativos</h4>
              <p>{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSection;
