// src/components/AIDashboard.js
import React, { useState, useEffect } from 'react';
import { analyzeWithAI } from '../utils/aiFinancialAdvanced';
import { formatCurrency } from '../utils/calculations';

const AIDashboard = ({ gastosData, rendimentosData, currentMonth }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    const performAnalysis = () => {
      setLoading(true);
      
      // Simular processamento
      setTimeout(() => {
        const result = analyzeWithAI(gastosData, rendimentosData);
        console.log('Análise IA:', result); // Para debug
        setAnalysis(result);
        setLoading(false);
      }, 1000);
    };

    performAnalysis();
  }, [gastosData, rendimentosData]);

  if (loading) {
    return (
      <div className="section">
        <div className="section-header">🤖 ASSISTENTE FINANCEIRO IA</div>
        <div className="section-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🧠</div>
            <div>Analisando seus dados financeiros...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              IA processando padrões, tendências e gerando insights personalizados
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="section">
        <div className="section-header">🤖 ASSISTENTE FINANCEIRO IA</div>
        <div className="section-content">
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
            <div>Erro ao processar dados</div>
            <div style={{ fontSize: '14px', marginTop: '10px' }}>
              Verifique se há dados suficientes para análise
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        🤖 ASSISTENTE FINANCEIRO IA
        <span style={{ fontSize: '12px', marginLeft: '10px', color: '#27ae60' }}>
          ✨ Análise Avançada
        </span>
      </div>
      <div className="section-content">
        
        {/* Status da análise */}
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#e8f4fd',
          border: '1px solid #3498db',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>🚀 Análise IA Completa</strong>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Processamento: {analysis.metadata?.processingTime}ms • 
                Qualidade dos dados: {analysis.metadata?.dataQuality || 'Boa'} • 
                {analysis.processedData?.expenses?.length || 0} transações analisadas
              </div>
            </div>
            {analysis.healthScore && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  color: analysis.healthScore.score > 70 ? '#27ae60' : 
                         analysis.healthScore.score > 40 ? '#f39c12' : '#e74c3c'
                }}>
                  {analysis.healthScore.score}/100
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>Saúde Financeira</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs de navegação */}
        <div style={{ 
          display: 'flex', 
          marginBottom: '20px', 
          borderBottom: '1px solid #ddd', 
          flexWrap: 'wrap',
          gap: '5px'
        }}>
          {[
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'predictions', label: 'Previsões', icon: '🔮' },
            { id: 'categories', label: 'Categorias', icon: '📊' },
            { id: 'patterns', label: 'Padrões', icon: '📈' },
            { id: 'recommendations', label: 'Dicas', icon: '💰' },
            { id: 'alerts', label: 'Alertas', icon: '⚠️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 15px',
                border: 'none',
                background: activeTab === tab.id ? '#3498db' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#666',
                cursor: 'pointer',
                borderRadius: '5px 5px 0 0',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das tabs */}
        {activeTab === 'insights' && (
          <div>
            <h4>💡 Insights Inteligentes</h4>
            
            {analysis.insights && analysis.insights.length > 0 ? (
              <div>
                {analysis.insights.map((insight, index) => (
                  <div key={index} style={{
                    padding: '15px',
                    margin: '10px 0',
                    backgroundColor: 
                      insight.priority === 'high' ? '#fff3cd' : 
                      insight.priority === 'medium' ? '#d1ecf1' : '#f8f9fa',
                    border: `1px solid ${
                      insight.priority === 'high' ? '#ffeaa7' : 
                      insight.priority === 'medium' ? '#bee5eb' : '#dee2e6'
                    }`,
                    borderRadius: '8px',
                    borderLeft: `4px solid ${
                      insight.priority === 'high' ? '#f39c12' : 
                      insight.priority === 'medium' ? '#3498db' : '#6c757d'
                    }`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong>{insight.title}</strong>
                      <span style={{ 
                        background: 
                          insight.priority === 'high' ? '#f39c12' : 
                          insight.priority === 'medium' ? '#3498db' : '#6c757d',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}>
                        {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
                      {insight.description}
                    </p>
                    
                    {insight.tips && insight.tips.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong style={{ fontSize: '12px', color: '#27ae60' }}>💡 Dicas:</strong>
                        <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', fontSize: '12px' }}>
                          {insight.tips.slice(0, 2).map((tip, tipIndex) => (
                            <li key={tipIndex} style={{ color: '#666', marginBottom: '2px' }}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
                <div>Nenhum insight disponível</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>
                  Adicione mais dados para obter análises detalhadas
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <h4>🔮 Previsões Inteligentes</h4>
            
            {analysis.predictions && (
              <div>
                {/* Card principal de previsão */}
                <div style={{ 
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #dee2e6'
                }}>
                  <div className="summary-cards">
                    <div className="summary-card">
                      <div className="summary-value" style={{color: '#e74c3c'}}>
                        {formatCurrency(analysis.predictions.nextMonth)}
                      </div>
                      <div className="summary-label">Previsão Próximo Mês</div>
                    </div>
                    
                    <div className="summary-card">
                      <div className="summary-value" style={{color: '#3498db'}}>
                        {analysis.predictions.confidence === 'high' ? 'Alta' : 
                         analysis.predictions.confidence === 'medium' ? 'Média' : 'Baixa'}
                      </div>
                      <div className="summary-label">Confiança</div>
                    </div>
                    
                    {analysis.predictions.range && (
                      <div className="summary-card">
                        <div className="summary-value" style={{color: '#f39c12', fontSize: '1rem'}}>
                          {formatCurrency(analysis.predictions.range.min)} - {formatCurrency(analysis.predictions.range.max)}
                        </div>
                        <div className="summary-label">Faixa Esperada</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Métodos de previsão */}
                {analysis.predictions.methods && (
                  <div>
                    <h5>🔬 Métodos de Previsão</h5>
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Método</th>
                            <th>Previsão</th>
                            <th>Descrição</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>📊 Média Simples</td>
                            <td className="valor">{formatCurrency(analysis.predictions.methods.average)}</td>
                            <td>Baseado na média dos últimos meses</td>
                          </tr>
                          <tr>
                            <td>📈 Tendência</td>
                            <td className="valor">{formatCurrency(analysis.predictions.methods.trend)}</td>
                            <td>Considera a tendência de crescimento/decrescimento</td>
                          </tr>
                          <tr>
                            <td>🌊 Sazonal</td>
                            <td className="valor">{formatCurrency(analysis.predictions.methods.seasonal)}</td>
                            <td>Ajustado para padrões sazonais</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h4>📊 Análise por Categorias</h4>
            
            {analysis.processedData?.categories && Object.keys(analysis.processedData.categories).length > 0 ? (
              <div>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Total</th>
                        <th>Percentual</th>
                        <th>Transações</th>
                        <th>Média/Transação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analysis.processedData.categories)
                        .sort(([,a], [,b]) => b - a)
                        .map(([category, amount]) => {
                          const total = analysis.processedData.totalExpenses;
                          const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                          const transactions = analysis.processedData.expenses?.filter(e => e.category === category).length || 0;
                          const avgPerTransaction = transactions > 0 ? amount / transactions : 0;
                          
                          return (
                            <tr key={category}>
                              <td>
                                <strong>{category}</strong>
                                <div style={{ fontSize: '11px', color: '#666' }}>
                                  {transactions} transação{transactions !== 1 ? 'ões' : ''}
                                </div>
                              </td>
                              <td className="valor">{formatCurrency(amount)}</td>
                              <td className="valor">
                                <span style={{
                                  color: percentage > 30 ? '#e74c3c' : percentage > 15 ? '#f39c12' : '#27ae60'
                                }}>
                                  {percentage}%
                                </span>
                              </td>
                              <td className="valor">{transactions}</td>
                              <td className="valor">{formatCurrency(avgPerTransaction)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                <div>Nenhuma categoria encontrada</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div>
            <h4>📈 Análise de Padrões</h4>
            
            {analysis.patterns && (
              <div>
                {/* Cards de padrões */}
                <div className="summary-cards">
                  {analysis.patterns.trend && (
                    <div className="summary-card">
                      <div className="summary-value" style={{
                        
color: analysis.patterns.trend.direction === 'increasing' ? '#e74c3c' : 
analysis.patterns.trend.direction === 'decreasing' ? '#27ae60' : '#3498db'
}}>
{analysis.patterns.trend.direction === 'increasing' ? '📈' : 
analysis.patterns.trend.direction === 'decreasing' ? '📉' : '➡️'}
</div>
<div className="summary-label">
Tendência: {analysis.patterns.trend.direction === 'increasing' ? 'Crescendo' : 
    analysis.patterns.trend.direction === 'decreasing' ? 'Diminuindo' : 'Estável'}
</div>
</div>
)}

{analysis.patterns.volatility !== undefined && (
<div className="summary-card">
<div className="summary-value" style={{
color: analysis.patterns.volatility > 0.5 ? '#e74c3c' : 
analysis.patterns.volatility > 0.3 ? '#f39c12' : '#27ae60'
}}>
{(analysis.patterns.volatility * 100).toFixed(0)}%
</div>
<div className="summary-label">Volatilidade</div>
</div>
)}

{analysis.patterns.seasonality && (
<div className="summary-card">
<div className="summary-value" style={{color: '#9b59b6'}}>
{analysis.patterns.seasonality.peakSeason || 'N/A'}
</div>
<div className="summary-label">Época de Maior Gasto</div>
</div>
)}
</div>

{/* Gráfico de tendência mensal */}
{analysis.patterns.monthlyTotals && (
<div style={{ marginTop: '20px' }}>
<h5>📊 Evolução Mensal</h5>
<div style={{ 
display: 'flex', 
alignItems: 'end', 
gap: '8px', 
padding: '20px',
backgroundColor: '#f8f9fa',
borderRadius: '8px',
overflowX: 'auto',
minHeight: '150px'
}}>
{analysis.patterns.monthlyTotals.map((value, index) => {
const maxValue = Math.max(...analysis.patterns.monthlyTotals);
const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

return (
<div key={index} style={{ 
display: 'flex', 
flexDirection: 'column', 
alignItems: 'center',
minWidth: '50px'
}}>
<div style={{ fontSize: '10px', marginBottom: '5px', color: '#666' }}>
{formatCurrency(value)}
</div>
<div
style={{
 height: `${height}px`,
 width: '30px',
 backgroundColor: value > 0 ? '#3498db' : '#ecf0f1',
 borderRadius: '3px 3px 0 0',
 marginBottom: '5px',
 transition: 'all 0.3s ease'
}}
title={`${months[index]}: ${formatCurrency(value)}`}
></div>
<div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>
{months[index]}
</div>
</div>
);
})}
</div>
</div>
)}
</div>
)}
</div>
)}

{activeTab === 'recommendations' && (
<div>
<h4>💰 Recomendações Personalizadas</h4>

{analysis.recommendations && analysis.recommendations.length > 0 ? (
<div>
{analysis.recommendations.map((rec, index) => (
<div key={index} style={{
padding: '15px',
margin: '10px 0',
backgroundColor: '#d5f4e6',
border: '1px solid #27ae60',
borderRadius: '8px'
}}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
<strong>💡 {rec.category}</strong>
<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
<span style={{ 
background: rec.difficulty === 'Fácil' ? '#27ae60' : 
      rec.difficulty === 'Médio' ? '#f39c12' : '#e74c3c',
color: 'white',
padding: '2px 8px',
borderRadius: '12px',
fontSize: '12px'
}}>
{rec.difficulty}
</span>
{rec.confidence && (
<span style={{ fontSize: '12px', color: '#666' }}>
{(rec.confidence * 100).toFixed(0)}% confiança
</span>
)}
</div>
</div>
<p style={{ margin: '5px 0', fontSize: '14px' }}>{rec.tip}</p>
<div style={{ 
color: '#27ae60', 
fontWeight: 'bold',
fontSize: '14px'
}}>
💰 Economia potencial: {formatCurrency(rec.potential_saving || rec.potentialSaving)}
</div>
</div>
))}

<div style={{
marginTop: '20px',
padding: '15px',
backgroundColor: '#fff3cd',
border: '1px solid #ffeaa7',
borderRadius: '8px'
}}>
<strong>🎯 Economia Total Potencial:</strong>
<div style={{ fontSize: '18px', color: '#27ae60', fontWeight: 'bold', marginTop: '5px' }}>
{formatCurrency(
analysis.recommendations.reduce((total, rec) => 
total + (rec.potential_saving || rec.potentialSaving || 0), 0
)
)}
</div>
</div>
</div>
) : (
<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
<div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
<div>Parabéns! Seus gastos estão bem controlados.</div>
<div style={{ fontSize: '14px', marginTop: '10px' }}>
A IA não encontrou oportunidades significativas de economia no momento.
</div>
</div>
)}
</div>
)}

{activeTab === 'alerts' && (
<div>
<h4>⚠️ Alertas Inteligentes</h4>

{analysis.alerts && analysis.alerts.length > 0 ? (
<div>
{analysis.alerts.map((alert, index) => (
<div key={index} style={{
padding: '15px',
margin: '10px 0',
backgroundColor: alert.type === 'warning' ? '#fff3cd' : 
    alert.type === 'danger' ? '#f8d7da' : '#d1ecf1',
border: `1px solid ${alert.type === 'warning' ? '#ffeaa7' : 
         alert.type === 'danger' ? '#f5c6cb' : '#bee5eb'}`,
borderRadius: '8px',
borderLeft: `4px solid ${alert.priority === 'high' ? '#e74c3c' : 
             alert.priority === 'medium' ? '#f39c12' : '#3498db'}`
}}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
<strong>{alert.title}</strong>
<span style={{ 
background: alert.priority === 'high' ? '#e74c3c' : 
    alert.priority === 'medium' ? '#f39c12' : '#3498db',
color: 'white',
padding: '2px 8px',
borderRadius: '12px',
fontSize: '12px'
}}>
{alert.priority === 'high' ? 'Alta' : 
alert.priority === 'medium' ? 'Média' : 'Baixa'}
</span>
</div>
<p style={{ margin: '0', fontSize: '14px' }}>{alert.message || alert.description}</p>

{alert.actionable && (
<div style={{ 
marginTop: '10px', 
padding: '8px', 
backgroundColor: 'rgba(255,255,255,0.5)', 
borderRadius: '4px',
fontSize: '12px'
}}>
💡 <strong>Ação recomendada:</strong> Revise os gastos desta categoria e considere as dicas de economia.
</div>
)}
</div>
))}
</div>
) : (
<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
<div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
<div>Tudo sob controle!</div>
<div style={{ fontSize: '14px', marginTop: '10px' }}>
Não há alertas no momento. Suas finanças estão equilibradas.
</div>
</div>
)}
</div>
)}

{/* Informações sobre a IA */}
<div style={{ 
marginTop: '30px', 
padding: '15px', 
backgroundColor: '#f8f9fa', 
borderRadius: '8px',
fontSize: '12px',
color: '#666',
borderTop: '1px solid #ddd'
}}>
<p><strong>🤖 Sobre o Assistente IA:</strong></p>
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
<div style={{ flex: '1', minWidth: '250px' }}>
<ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
<li>Categorização automática inteligente de gastos</li>
<li>Análise de padrões e tendências comportamentais</li>
<li>Previsões usando múltiplos algoritmos</li>
<li>Detecção de anomalias e alertas personalizados</li>
</ul>
</div>
<div style={{ flex: '1', minWidth: '250px' }}>
<ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
<li>Recomendações baseadas em análise de dados</li>
<li>Score de saúde financeira em tempo real</li>
<li>Análise sazonal e de volatilidade</li>
<li>Insights acionáveis e personalizados</li>
</ul>
</div>
</div>

<div style={{ 
marginTop: '10px', 
padding: '8px', 
backgroundColor: '#e8f4fd', 
borderRadius: '4px',
textAlign: 'center'
}}>
<strong>🔄 Atualização automática:</strong> A análise é recalculada sempre que você adiciona novos dados
</div>
</div>
</div>
</div>
);
};

export default AIDashboard;
