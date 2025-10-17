// src/components/QuickStats.js
import React, { useMemo } from 'react';
import { useAIAnalysis } from '../hooks/useAIAnalysis.js';
import { formatCurrency } from '../utils/calculations.js';

const QuickStats = ({ gastosData, onOpenAI }) => {
  // Usar hook otimizado para análise IA
  const { analysis, loading, error, hasData } = useAIAnalysis(gastosData, {}, 300);

  // Memoizar estatísticas calculadas
  const stats = useMemo(() => {
    if (!hasData) {
      return {
        totalExpenses: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        topCategory: null,
        healthScore: 0
      };
    }

    if (analysis && analysis.processedData) {
      return {
        totalExpenses: analysis.processedData.totalExpenses || 0,
        totalTransactions: analysis.processedData.totalTransactions || 0,
        averageTransaction: analysis.processedData.averageTransaction || 0,
        topCategory: analysis.patterns?.topCategories?.[0] || null,
        healthScore: analysis.healthScore?.score || 0
      };
    }

    // Fallback: calcular estatísticas básicas
    const allExpenses = Object.values(gastosData).flat();
    const total = allExpenses.reduce((sum, expense) => sum + (expense.valor || 0), 0);
    
    return {
      totalExpenses: total,
      totalTransactions: allExpenses.length,
      averageTransaction: allExpenses.length > 0 ? total / allExpenses.length : 0,
      topCategory: null,
      healthScore: 50
    };
  }, [analysis, hasData, gastosData]);

  const aiWorking = analysis && analysis.processedData;

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <div>Analisando com IA...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
        <div>Erro na análise: {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
        <div>Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#495057' }}>📊 Estatísticas Rápidas</h3>
        {aiWorking && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#28a745'
          }}>
            <span>🤖</span>
            <span>IA Ativa</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {/* Total de Gastos */}
        <div style={{
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffeaa7'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
            {formatCurrency(stats.totalExpenses)}
          </div>
          <div style={{ fontSize: '14px', color: '#856404' }}>Total Gasto</div>
        </div>

        {/* Total de Transações */}
        <div style={{
          padding: '16px',
          backgroundColor: '#d1ecf1',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #bee5eb'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
            {stats.totalTransactions}
          </div>
          <div style={{ fontSize: '14px', color: '#0c5460' }}>Transações</div>
        </div>

        {/* Média por Transação */}
        <div style={{
          padding: '16px',
          backgroundColor: '#d4edda',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #c3e6cb'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
            {formatCurrency(stats.averageTransaction)}
          </div>
          <div style={{ fontSize: '14px', color: '#155724' }}>Média/Transação</div>
        </div>

        {/* Categoria Top */}
        {stats.topCategory && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f8d7da',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #f5c6cb'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>
              {stats.topCategory.percentage}%
            </div>
            <div style={{ fontSize: '14px', color: '#721c24' }}>
              {stats.topCategory.category}
            </div>
          </div>
        )}

        {/* Score de Saúde Financeira */}
        <div style={{
          padding: '16px',
          backgroundColor: stats.healthScore >= 70 ? '#d4edda' : stats.healthScore >= 40 ? '#fff3cd' : '#f8d7da',
          borderRadius: '8px',
          textAlign: 'center',
          border: `1px solid ${stats.healthScore >= 70 ? '#c3e6cb' : stats.healthScore >= 40 ? '#ffeaa7' : '#f5c6cb'}`
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: stats.healthScore >= 70 ? '#155724' : stats.healthScore >= 40 ? '#856404' : '#721c24'
          }}>
            {stats.healthScore}/100
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: stats.healthScore >= 70 ? '#155724' : stats.healthScore >= 40 ? '#856404' : '#721c24'
          }}>
            Score Financeiro
          </div>
        </div>
      </div>

      {/* Botão para abrir IA Dashboard */}
      {onOpenAI && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={onOpenAI}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🤖</span>
            <span>Análise Completa com IA</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickStats;