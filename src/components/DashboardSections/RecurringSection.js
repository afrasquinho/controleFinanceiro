import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const RecurringSection = ({ gastosData, gastosFixos, onAddGasto, onUpdateGasto }) => {
  const [recurringRules, setRecurringRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Carregar regras salvas
  useEffect(() => {
    const savedRules = localStorage.getItem('recurring_rules');
    if (savedRules) {
      setRecurringRules(JSON.parse(savedRules));
    }
  }, []);

  // Salvar regras
  const saveRules = (rules) => {
    setRecurringRules(rules);
    localStorage.setItem('recurring_rules', JSON.stringify(rules));
  };

  // Detectar padrões de recorrência
  const detectPatterns = useMemo(() => {
    const patterns = [];
    const allGastos = Object.values(gastosData).flat();
    
    // Agrupar por descrição similar
    const gastosByDescription = {};
    allGastos.forEach(gasto => {
      const key = gasto.desc?.toLowerCase().trim();
      if (key) {
        if (!gastosByDescription[key]) {
          gastosByDescription[key] = [];
        }
        gastosByDescription[key].push(gasto);
      }
    });

    // Analisar padrões
    Object.entries(gastosByDescription).forEach(([desc, gastos]) => {
      if (gastos.length >= 2) {
        // Ordenar por data
        const sortedGastos = gastos.sort((a, b) => new Date(a.data) - new Date(b.data));
        
        // Calcular intervalos
        const intervals = [];
        for (let i = 1; i < sortedGastos.length; i++) {
          const diff = new Date(sortedGastos[i].data) - new Date(sortedGastos[i-1].data);
          intervals.push(diff / (1000 * 60 * 60 * 24)); // em dias
        }

        // Detectar padrão
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const isRegular = intervals.every(interval => 
          Math.abs(interval - avgInterval) <= 3 // tolerância de 3 dias
        );

        if (isRegular && avgInterval >= 7) { // pelo menos semanal
          const frequency = avgInterval <= 7 ? 'weekly' : 
                           avgInterval <= 14 ? 'biweekly' :
                           avgInterval <= 31 ? 'monthly' : 'yearly';

          patterns.push({
            id: `pattern-${desc}`,
            description: desc,
            frequency,
            interval: Math.round(avgInterval),
            amount: gastos[0].valor,
            category: gastos[0].categoria || 'outros',
            lastDate: sortedGastos[sortedGastos.length - 1].data,
            count: gastos.length,
            confidence: Math.min(gastos.length / 3, 1) // confiança baseada na quantidade
          });
        }
      }
    });

    return patterns;
  }, [gastosData]);

  // Criar regra de recorrência
  const createRecurringRule = (rule) => {
    const newRule = {
      id: `rule-${Date.now()}`,
      ...rule,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastExecuted: null,
      executions: 0
    };

    const updatedRules = [...recurringRules, newRule];
    saveRules(updatedRules);
    setShowRuleForm(false);
    setEditingRule(null);
  };

  // Atualizar regra
  const updateRecurringRule = (ruleId, updates) => {
    const updatedRules = recurringRules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    saveRules(updatedRules);
    setEditingRule(null);
  };

  // Executar regra de recorrência
  const executeRule = (rule) => {
    const today = new Date();
    const lastExecution = rule.lastExecuted ? new Date(rule.lastExecuted) : new Date(rule.createdAt);
    
    let shouldExecute = false;
    const daysSinceLastExecution = (today - lastExecution) / (1000 * 60 * 60 * 24);

    switch (rule.frequency) {
      case 'daily':
        shouldExecute = daysSinceLastExecution >= 1;
        break;
      case 'weekly':
        shouldExecute = daysSinceLastExecution >= 7;
        break;
      case 'biweekly':
        shouldExecute = daysSinceLastExecution >= 14;
        break;
      case 'monthly':
        shouldExecute = daysSinceLastExecution >= 30;
        break;
      case 'yearly':
        shouldExecute = daysSinceLastExecution >= 365;
        break;
      default:
        shouldExecute = false;
        break;
    }

    if (shouldExecute) {
      const mesAtual = (today.getMonth() + 1).toString().padStart(2, '0');
      const dataAtual = today.toISOString().split('T')[0];

      const newGasto = {
        data: dataAtual,
        desc: rule.description,
        valor: rule.amount,
        categoria: rule.category,
        tag: rule.tag || '',
        timestamp: today.toISOString(),
        isRecurring: true,
        recurringRuleId: rule.id
      };

      onAddGasto(mesAtual, newGasto);

      // Atualizar regra
      updateRecurringRule(rule.id, {
        lastExecuted: today.toISOString(),
        executions: rule.executions + 1
      });

      return true;
    }

    return false;
  };

  // Executar todas as regras ativas
  const executeAllRules = () => {
    const executedRules = [];
    recurringRules.forEach(rule => {
      if (rule.isActive) {
        const executed = executeRule(rule);
        if (executed) {
          executedRules.push(rule);
        }
      }
    });
    return executedRules;
  };

  // Reconciliação automática
  const reconcileTransactions = () => {
    const allGastos = Object.values(gastosData).flat();
    const reconciled = [];
    const unmatched = [];

    allGastos.forEach(gasto => {
      if (gasto.isRecurring) {
        const rule = recurringRules.find(r => r.id === gasto.recurringRuleId);
        if (rule) {
          reconciled.push({
            gasto,
            rule,
            status: 'matched'
          });
        } else {
          unmatched.push({
            gasto,
            status: 'orphaned'
          });
        }
      } else {
        // Tentar encontrar regra correspondente
        const matchingRule = recurringRules.find(rule => 
          rule.isActive &&
          rule.description.toLowerCase() === gasto.desc?.toLowerCase() &&
          Math.abs(rule.amount - gasto.valor) < 0.01
        );

        if (matchingRule) {
          reconciled.push({
            gasto,
            rule: matchingRule,
            status: 'suggested'
          });
        } else {
          unmatched.push({
            gasto,
            status: 'unmatched'
          });
        }
      }
    });

    return { reconciled, unmatched };
  };

  // Obter próxima execução
  const getNextExecution = (rule) => {
    if (!rule.lastExecuted) {
      return new Date(rule.createdAt);
    }

    const lastExecution = new Date(rule.lastExecuted);
    const nextExecution = new Date(lastExecution);

    switch (rule.frequency) {
      case 'daily':
        nextExecution.setDate(lastExecution.getDate() + 1);
        break;
      case 'weekly':
        nextExecution.setDate(lastExecution.getDate() + 7);
        break;
      case 'biweekly':
        nextExecution.setDate(lastExecution.getDate() + 14);
        break;
      case 'monthly':
        nextExecution.setMonth(lastExecution.getMonth() + 1);
        break;
      case 'yearly':
        nextExecution.setFullYear(lastExecution.getFullYear() + 1);
        break;
      default:
        // Keep the same date if frequency is unknown
        break;
    }

    return nextExecution;
  };

  // Renderizar formulário de regra
  const renderRuleForm = () => {
    const rule = editingRule || {
      description: '',
      amount: 0,
      category: 'outros',
      frequency: 'monthly',
      tag: '',
      startDate: new Date().toISOString().split('T')[0]
    };

    return (
      <div className="rule-form-overlay">
        <div className="rule-form">
          <div className="form-header">
            <h3>{editingRule ? 'Editar Regra' : 'Nova Regra de Recorrência'}</h3>
            <button 
              className="close-btn"
              onClick={() => {
                setShowRuleForm(false);
                setEditingRule(null);
              }}
            >
              ×
            </button>
          </div>

          <div className="form-content">
            <div className="form-group">
              <label>Descrição:</label>
              <input
                type="text"
                value={rule.description}
                onChange={(e) => setEditingRule({...rule, description: e.target.value})}
                placeholder="Ex: Netflix, Spotify, Aluguel..."
              />
            </div>

            <div className="form-group">
              <label>Valor:</label>
              <input
                type="number"
                value={rule.amount}
                onChange={(e) => setEditingRule({...rule, amount: Number(e.target.value)})}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Categoria:</label>
              <select
                value={rule.category}
                onChange={(e) => setEditingRule({...rule, category: e.target.value})}
              >
                <option value="alimentacao">🍽️ Alimentação</option>
                <option value="transporte">🚗 Transporte</option>
                <option value="saude">🏥 Saúde</option>
                <option value="educacao">📚 Educação</option>
                <option value="lazer">🎬 Lazer</option>
                <option value="casa">🏠 Casa</option>
                <option value="vestuario">👕 Vestuário</option>
                <option value="outros">📦 Outros</option>
              </select>
            </div>

            <div className="form-group">
              <label>Frequência:</label>
              <select
                value={rule.frequency}
                onChange={(e) => setEditingRule({...rule, frequency: e.target.value})}
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div className="form-group">
              <label>Tag (opcional):</label>
              <input
                type="text"
                value={rule.tag}
                onChange={(e) => setEditingRule({...rule, tag: e.target.value})}
                placeholder="Ex: assinatura, fixo..."
              />
            </div>

            <div className="form-group">
              <label>Data de Início:</label>
              <input
                type="date"
                value={rule.startDate}
                onChange={(e) => setEditingRule({...rule, startDate: e.target.value})}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowRuleForm(false);
                setEditingRule(null);
              }}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => createRecurringRule(rule)}
              disabled={!rule.description || !rule.amount}
            >
              {editingRule ? 'Atualizar' : 'Criar'} Regra
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="recurring-section">
      <div className="section-header">
        <h1>🔄 Recorrência e Reconciliação</h1>
        <p>Gerencie gastos recorrentes e reconcilie transações automaticamente</p>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowRuleForm(true)}
          >
            + Nova Regra
          </button>
          <button 
            className="btn btn-secondary"
            onClick={executeAllRules}
          >
            Executar Regras
          </button>
        </div>
      </div>

      {/* Sugestões de Padrões */}
      {detectPatterns.length > 0 && (
        <div className="pattern-suggestions">
          <h3>💡 Padrões Detectados</h3>
          <div className="suggestions-grid">
            {detectPatterns.map(pattern => (
              <div key={pattern.id} className="suggestion-card">
                <div className="suggestion-header">
                  <h4>{pattern.description}</h4>
                  <span className="confidence">
                    {Math.round(pattern.confidence * 100)}% confiança
                  </span>
                </div>
                <div className="suggestion-details">
                  <p><strong>Frequência:</strong> {pattern.frequency}</p>
                  <p><strong>Valor:</strong> {formatCurrency(pattern.amount)}</p>
                  <p><strong>Ocorrências:</strong> {pattern.count}</p>
                </div>
                <div className="suggestion-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setEditingRule({
                        description: pattern.description,
                        amount: pattern.amount,
                        category: pattern.category,
                        frequency: pattern.frequency,
                        tag: 'detected'
                      });
                      setShowRuleForm(true);
                    }}
                  >
                    Criar Regra
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regras Ativas */}
      <div className="recurring-rules">
        <h3>📋 Regras de Recorrência</h3>
        <div className="rules-grid">
          {recurringRules.map(rule => {
            const nextExecution = getNextExecution(rule);
            const isOverdue = new Date() > nextExecution;
            
            return (
              <div key={rule.id} className={`rule-card ${!rule.isActive ? 'inactive' : ''}`}>
                <div className="rule-header">
                  <div className="rule-info">
                    <h4>{rule.description}</h4>
                    <span className="rule-frequency">{rule.frequency}</span>
                  </div>
                  <div className="rule-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setEditingRule(rule)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        const updatedRules = recurringRules.filter(r => r.id !== rule.id);
                        saveRules(updatedRules);
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>

                <div className="rule-details">
                  <div className="detail-row">
                    <span className="label">Valor:</span>
                    <span className="value">{formatCurrency(rule.amount)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Categoria:</span>
                    <span className="value">{rule.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Execuções:</span>
                    <span className="value">{rule.executions}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Próxima Execução:</span>
                    <span className={`value ${isOverdue ? 'overdue' : ''}`}>
                      {nextExecution.toLocaleDateString('pt-PT')}
                      {isOverdue && ' (Atrasada)'}
                    </span>
                  </div>
                </div>

                <div className="rule-status">
                  <label className="status-toggle">
                    <input
                      type="checkbox"
                      checked={rule.isActive}
                      onChange={(e) => updateRecurringRule(rule.id, { isActive: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                    <span className="status-text">
                      {rule.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reconciliação */}
      <div className="reconciliation-section">
        <h3>🔍 Reconciliação de Transações</h3>
        <div className="reconciliation-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              const { reconciled, unmatched } = reconcileTransactions();
              setSuggestions({ reconciled, unmatched });
            }}
          >
            Executar Reconciliação
          </button>
        </div>

        {suggestions.reconciled && (
          <div className="reconciliation-results">
            <div className="result-section">
              <h4>✅ Transações Reconciliadas ({suggestions.reconciled.length})</h4>
              <div className="reconciled-list">
                {suggestions.reconciled.map((item, index) => (
                  <div key={index} className="reconciled-item">
                    <span className="item-desc">{item.gasto.desc}</span>
                    <span className="item-value">{formatCurrency(item.gasto.valor)}</span>
                    <span className="item-rule">{item.rule.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h4>❓ Transações Não Reconciliadas ({suggestions.unmatched.length})</h4>
              <div className="unmatched-list">
                {suggestions.unmatched.map((item, index) => (
                  <div key={index} className="unmatched-item">
                    <span className="item-desc">{item.gasto.desc}</span>
                    <span className="item-value">{formatCurrency(item.gasto.valor)}</span>
                    <span className="item-status">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulário de Regra */}
      {showRuleForm && renderRuleForm()}
    </div>
  );
};

export default RecurringSection;

