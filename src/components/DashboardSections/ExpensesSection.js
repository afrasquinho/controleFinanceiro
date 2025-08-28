import React, { useState } from 'react';
import MonthContent from '../MonthContent';
import { mesesInfo } from '../../data/monthsData';
import { formatCurrency } from '../../utils/calculations';

const ExpensesSection = ({ 
  gastosData, 
  addGasto, 
  removeGasto 
}) => {
  const [currentMonth, setCurrentMonth] = useState('jan');

  // Calcular estatísticas de gastos
  const calculateExpenseStats = () => {
    const allExpenses = Object.values(gastosData).flat();
    const totalExpenses = allExpenses.reduce((sum, gasto) => sum + gasto.valor, 0);
    
    const byCategory = {};
    allExpenses.forEach(gasto => {
      if (!byCategory[gasto.categoria]) {
        byCategory[gasto.categoria] = 0;
      }
      byCategory[gasto.categoria] += gasto.valor;
    });

    const topCategories = Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalExpenses,
      totalTransactions: allExpenses.length,
      topCategories,
      averageExpense: allExpenses.length > 0 ? totalExpenses / allExpenses.length : 0
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
                <div key={category} className="category-item">
                  <span className="category-rank">{index + 1}.</span>
                  <span className="category-name">{category}</span>
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
