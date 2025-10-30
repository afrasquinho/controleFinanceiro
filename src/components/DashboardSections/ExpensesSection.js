import React, { useState, useMemo } from 'react';
import MonthContent from '../MonthContent.js';
import { mesesInfo } from '../../data/monthsData.js';
import { formatCurrency } from '../../utils/calculations.js';

const ExpensesSection = ({ 
  gastosData,
  gastosFixos,
  addGasto, 
  removeGasto 
}) => {
  const [currentMonth, setCurrentMonth] = useState('jan');

  // Lista do mês atual
  const monthList = useMemo(() => Array.isArray(gastosData[currentMonth]) ? gastosData[currentMonth] : [], [gastosData, currentMonth]);

  // Calcular estatísticas do mês (fixos + variáveis do mês selecionado)
  const calculateExpenseStats = () => {
    const allExpenses = monthList;
    const totalVariaveis = allExpenses.reduce((sum, gasto) => sum + (gasto.valor || 0), 0);
    const fixosMes = (gastosFixos && gastosFixos[currentMonth]) ? gastosFixos[currentMonth] : {};
    const totalFixos = Object.values(fixosMes).reduce((s, v) => s + (v || 0), 0);
    const totalExpenses = totalVariaveis + totalFixos;
    
    const byCategory = {};
    allExpenses.forEach(gasto => {
      if (!byCategory[gasto.categoria]) {
        byCategory[gasto.categoria] = 0;
      }
      byCategory[gasto.categoria] += (gasto.valor || 0);
    });

    const topCategories = Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalExpenses,
      totalVariaveis,
      totalFixos,
      totalTransactions: allExpenses.length,
      topCategories,
      averageExpense: allExpenses.length > 0 ? totalVariaveis / allExpenses.length : 0
    };
  };

  const stats = calculateExpenseStats();

  return (
    <div className="expenses-section">
      <div className="section-header">
        <h1>💰 Gestão de Gastos</h1>
        <p>Controle e análise detalhada dos seus gastos</p>
      </div>

      {/* Expense Overview */}
      <div className="expense-overview">
        <div className="overview-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Gasto</h3>
            <div className="card-value">{formatCurrency(stats.totalExpenses)}</div>
            <div className="card-subtext">{stats.totalTransactions} transações</div>
            <div className="card-subtext" style={{ fontSize: '12px', opacity: 0.75 }}>+ Fixos: {formatCurrency(stats.totalFixos)}</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Média por Transação</h3>
            <div className="card-value">{formatCurrency(stats.averageExpense)}</div>
            <div className="card-subtext">Valor médio</div>
          </div>
        </div>

        <div className="overview-card">
          <div className="card-icon">🏆</div>
          <div className="card-content">
            <h3>Top Categorias</h3>
            <div className="categories-list">
              {stats.topCategories.map(([category, amount], index) => (
                <div key={category || `category-${index}`} className="category-item">
                  <span className="category-rank">{index + 1}.</span>
                  <span className="category-name">{category || 'Categoria não definida'}</span>
                  <span className="category-amount">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="month-navigation">
        <h3>📅 Navegação por Meses</h3>
        <div className="tabs">
          {mesesInfo.map(mes => (
            <button
              key={mes.id}
              className={`tab ${currentMonth === mes.id ? 'active' : ''}`}
              onClick={() => setCurrentMonth(mes.id)}
            >
              {mes.nome}
              {gastosData[mes.id] && gastosData[mes.id].length > 0 && (
                <span className="data-indicator"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Month Content */}
      {mesesInfo.map(mes => (
        <div key={mes.id} className={`month-content-wrapper ${currentMonth === mes.id ? 'active' : ''}`}>
          <MonthContent
            mes={mes}
            isActive={currentMonth === mes.id}
            gastos={gastosData[mes.id] || []}
            onAddGasto={addGasto}
            onRemoveGasto={removeGasto}
            gastosData={gastosData}
          />
        </div>
      ))}
    </div>
  );
};

export default ExpensesSection;
