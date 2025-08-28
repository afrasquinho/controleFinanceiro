import React, { useState, useEffect } from 'react';
import { analyzeWithAI } from '../../utils/aiAdvanced';
import { formatCurrency } from '../../utils/calculations';

const PredictionsSection = ({ gastosData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performAnalysis = () => {
      setLoading(true);
      
      setTimeout(() => {
        const result = analyzeWithAI(gastosData, {});
        setAnalysis(result);
        setLoading(false);
      }, 1000);
    };

    if (Object.keys(gastosData).length > 0) {
      performAnalysis();
    } else {
      setLoading(false);
    }
  }, [gastosData]);

  if (loading) {
    return (
      <div className="predictions-section">
        <div className="section-header">
          <h1>🔮 Previsões Financeiras</h1>
          <p>Análise preditiva baseada em IA</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Analisando dados para previsões...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.predictions) {
    return (
      <div className="predictions-section">
        <div className="section-header">
          <h1>🔮 Previsões Financeiras</h1>
          <p>Análise preditiva baseada em IA</p>
        </div>
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>Dados insuficientes</h3>
          <p>Adicione mais transações para obter previsões precisas</p>
        </div>
      </div>
    );
  }

  const { predictions } = analysis;

  return (
    <div className="predictions-section">
      <div className="section-header">
        <h1>🔮 Previsões Financeiras</h1>
        <p>Análise preditiva baseada em IA</p>
      </div>

      {/* Main Prediction Card */}
      <div className="prediction-main-card">
        <div className="prediction-header">
          <div className="prediction-title">
            <h2>Previsão para o Próximo Mês</h2>
            <span className="confidence-badge">
              Confiança: {predictions.confidence === 'high' ? 'Alta' : 
                         predictions.confidence === 'medium' ? 'Média' : 'Baixa'}
            </span>
          </div>
          <div className="prediction-value">
            {formatCurrency(predictions.nextMonth)}
          </div>
        </div>

        {predictions.range && (
          <div className="prediction-range">
            <div className="range-label">Faixa esperada:</div>
            <div className="range-values">
              {formatCurrency(predictions.range.min)} - {formatCurrency(predictions.range.max)}
            </div>
          </div>
        )}
      </div>

      {/* Prediction Methods */}
      <div className="prediction-methods">
        <h3>📊 Métodos de Previsão</h3>
        <div className="methods-grid">
          <div className="method-card">
            <div className="method-icon">📈</div>
            <div className="method-content">
              <h4>Média Simples</h4>
              <div className="method-value">
                {formatCurrency(predictions.methods?.average || 0)}
              </div>
              <p>Baseado na média dos últimos meses</p>
            </div>
          </div>

          <div className="method-card">
            <div className="method-icon">📊</div>
            <div className="method-content">
              <h4>Tendência</h4>
              <div className="method-value">
                {formatCurrency(predictions.methods?.trend || 0)}
              </div>
              <p>Considera padrões de crescimento</p>
            </div>
          </div>

          <div className="method-card">
            <div className="method-icon">🌊</div>
            <div className="method-content">
              <h4>Sazonal</h4>
              <div className="method-value">
                {formatCurrency(predictions.methods?.seasonal || 0)}
              </div>
              <p>Ajustado para sazonalidade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trends */}
      {analysis.patterns?.monthlyTotals && (
        <div className="historical-trends">
          <h3>📈 Tendência Histórica</h3>
          <div className="trend-chart">
            {analysis.patterns.monthlyTotals.map((value, index) => {
              const maxValue = Math.max(...analysis.patterns.monthlyTotals);
              const height = maxValue > 0 ? Math.max((value / maxValue) * 100, 5) : 5;
              const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
              
              return (
                <div key={index} className="trend-bar">
                  <div 
                    className="bar-fill"
                    style={{ height: `${height}px` }}
                    title={`${months[index]}: ${formatCurrency(value)}`}
                  ></div>
                  <div className="bar-label">{months[index]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="ai-insights">
        <h3>💡 Insights da IA</h3>
        {analysis.insights && analysis.insights.slice(0, 3).map((insight, index) => (
          <div key={index} className="insight-card">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
              {insight.tips && insight.tips.length > 0 && (
                <div className="insight-tips">
                  <strong>Dicas:</strong>
                  <ul>
                    {insight.tips.slice(0, 2).map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PredictionsSection;
