// src/components/QuickStats.js
import React, { useState, useEffect } from 'react';
import { analyzeWithAI } from '../utils/aiAdvanced';
import { formatCurrency } from '../utils/calculations';

const QuickStats = ({ gastosData, onOpenAI }) => {
  const [stats, setStats] = useState(null);
  const [aiWorking, setAiWorking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAI = () => {
      console.log('🧪 QuickStats testando IA...');
      console.log('📊 Dados recebidos:', gastosData);
      
      try {
        // Verificar se há dados
        const totalTransactions = Object.values(gastosData).flat().length;
        console.log('📝 Total de transações:', totalTransactions);
        
        if (totalTransactions === 0) {
          setStats({
            totalExpenses: 0,
            totalTransactions: 0,
            averageTransaction: 0,
            topCategory: null,
            healthScore: 0
          });
          return;
        }

        // Testar IA
        console.log('🤖 Chamando analyzeWithAI...');
        const result = analyzeWithAI(gastosData);
        console.log('✅ Resultado da IA:', result);
        
        if (result && result.processedData) {
          setStats({
            totalExpenses: result.processedData.totalExpenses || 0,
            totalTransactions: result.processedData.totalTransactions || 0,
            averageTransaction: result.processedData.averageTransaction || 0,
            topCategory: result.patterns?.topCategories?.[0] || null,
            healthScore: result.healthScore?.score || 0
          });
          setAiWorking(true);
        } else {
          throw new Error('IA retornou dados inválidos');
        }
        
      } catch (err) {
        console.error('❌ Erro na IA:', err);
        setError(err.message);
        
        // Fallback: calcular estatísticas básicas
        const allExpenses = Object.values(gastosData).flat();
        const total = allExpenses.reduce((sum, expense) => sum + (expense.valor || 0), 0);
        
        setStats({
          totalExpenses: total,
          totalTransactions: allExpenses.length,
          averageTransaction: allExpenses.length > 0 ? total / allExpenses.length : 0,
          topCategory: null,
          healthScore: 50
        });
      }
    };

    testAI();
  }, [gastosData]);

  if (!stats) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <div>Carregando estatísticas...</div>
      </div>
    );
  }

  if (stats.totalTransactions === 0) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        border: '2px dashed #dee2e6'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
        <div style={{ fontSize: '16px', color: '#495057', marginBottom: '5px' }}>
          Nenhum dado para análise
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          Adicione alguns gastos para ver estatísticas inteligentes
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '25px' }}>
      {/* Header com status da IA */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#495057' }}>
          📊 Resumo {aiWorking ? '🤖 IA' : '📱 Básico'}
        </h3>
        <div style={{ fontSize: '12px' }}>
          {aiWorking ? (
            <span style={{ color: '#27ae60' }}>✅ IA Funcionando</span>
          ) : (
            <span style={{ color: '#e74c3c' }}>⚠️ IA com Problemas</span>
          )}
        </div>
      </div>

      {/* Mostrar erro se houver */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#856404'
        }}>
          <strong>⚠️ Problema na IA:</strong> {error}
        </div>
      )}

      {/* Grid de estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '15px'
      }}>
        
        {/* Total de Gastos */}
        <div className="summary-card" style={{ 
          padding: '15px', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: 'white',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(stats.totalExpenses)}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Total de Gastos</div>
        </div>

        {/* Total de Transações */}
        <div className="summary-card" style={{ 
          padding: '15px', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
          color: 'white',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.totalTransactions}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Transações</div>
        </div>

        {/* Média por Transação */}
        <div className="summary-card" style={{ 
          padding: '15px', 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
          color: '#2d3436',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(stats.averageTransaction)}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Média por Gasto</div>
        </div>

        {/* Categoria Principal */}
        {stats.topCategory && (
          <div className="summary-card" style={{ 
            padding: '15px', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
            color: 'white',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
              {stats.topCategory.name}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Categoria Principal</div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '3px' }}>
              {formatCurrency(stats.topCategory.total)}
            </div>
          </div>
        )}

        {/* Score de Saúde */}
        <div className="summary-card" style={{ 
          padding: '15px', 
          textAlign: 'center',
          background: stats.healthScore > 70 ? 
            'linear-gradient(135deg, #00b894, #00a085)' : 
            stats.healthScore > 40 ? 
            'linear-gradient(135deg, #fdcb6e, #e17055)' : 
            'linear-gradient(135deg, #e17055, #d63031)',
          color: 'white',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.healthScore}/100
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>
            Saúde {aiWorking ? 'IA' : 'Básica'}
          </div>
        </div>

        {/* Botão IA */}
        <div 
          className="summary-card" 
          style={{ 
            padding: '15px', 
            textAlign: 'center', 
            cursor: 'pointer',
            background: aiWorking ? 
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
              'linear-gradient(135deg, #95a5a6, #7f8c8d)',
            color: 'white',
            borderRadius: '10px'
          }}
          onClick={onOpenAI}
        >
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>
            {aiWorking ? '🤖' : '🔧'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: 'bold' }}>
            {aiWorking ? 'IA Completa' : 'Debug IA'}
          </div>
        </div>
      </div>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#e9ecef',
          borderRadius: '5px',
          fontSize: '11px',
          color: '#495057'
        }}>
          <strong>🔧 Debug:</strong> IA {aiWorking ? 'OK' : 'ERRO'} | 
          Dados: {Object.keys(gastosData).join(', ')} | 
          Total: {stats.totalTransactions} transações
          {error && ` | Erro: ${error}`}
        </div>
      )}
    </div>
  );
};

export default QuickStats;
