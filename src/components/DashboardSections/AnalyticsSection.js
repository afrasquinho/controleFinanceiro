import React, { useState, useEffect } from 'react';
import { analyzeWithAI } from '../../utils/aiAdvanced';
import { formatCurrency } from '../../utils/calculations';

const AnalyticsSection = ({ gastosData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories');

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
      <div className="analytics-section">
        <div className="section-header">
          <h1>📈 Análises Avançadas</h1>
          <p>Insights detalhados com IA</p>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Processando análise avançada...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analytics-section">
        <div className="section-header">
          <h1>📈 Análises Avançadas</h1>
          <p>Insights detalhados com IA</p>
        </div>
        <div className="no-data">
          <div className="no-data-icon">📊</div>
          <h3>Dados insuficientes</h3>
          <p>Adicione mais transações para análise detalhada</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'categories', label: 'Categorias', icon: '📊' },
    { id: 'patterns', label: 'Padrões', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'recommendations', label: 'Recomendações', icon: '💰' },
    { id: 'alerts', label: 'Alertas', icon: '⚠️' }
  ];

  return (
    <div className="analytics-section">
      <div className="section-header">
        <h1>📈 Análises Avançadas</h1>
        <p>Insights detalhados com IA</p>
      </div>

      {/* Health Score */}
      {analysis.healthScore && (
        <div className="health-score-card">
          <div className="score-content">
            <div className="score-icon">❤️</div>
            <div className="score-details">
              <h3>Saúde Financeira</h3>
              <div className="score-value">
                {analysis.healthScore.score}/100
              </div>
              <div className="score-description">
                {analysis.healthScore.description}
              </div>
            </div>
          </div>
          <div className="score-progress">
            <div 
              className="progress-bar"
              style={{ width: `${analysis.healthScore.score}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="analytics-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="analytics-content">
        {activeTab === 'categories' && analysis.processedData?.categories && (
          <div className="categories-content">
            <h3>📊 Distribuição por Categorias</h3>
            <div className="categories-table">
              <div className="table-header">
                <span>Categoria</span>
                <span>Total</span>
                <span>%</span>
                <span>Transações</span>
              </div>
              {Object.entries(analysis.processedData.categories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const total = analysis.processedData.totalExpenses;
                  const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                  const transactions = analysis.processedData.expenses?.filter(e => e.category === category).length || 0;
                  
                  return (
                    <div key={category} className="category-row">
                      <span className="category-name">{category}</span>
                      <span className="category-amount">{formatCurrency(amount)}</span>
                      <span className="category-percentage">{percentage}%</span>
                      <span className="category-transactions">{transactions}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {activeTab === 'patterns' && analysis.patterns && (
          <div className="patterns-content">
            <h3>📈 Padrões Detectados</h3>
            <div className="patterns-grid">
              <div className="pattern-card">
                <div className="pattern-icon">📈</div>
                <div className="pattern-content">
                  <h4>Tendência</h4>
                  <p>
                    {analysis.patterns.trend?.direction === 'increasing' ? 'Crescendo' :
                     analysis.patterns.trend?.direction === 'decreasing' ? 'Diminuindo' : 'Estável'}
                  </p>
                </div>
              </div>

              <div className="pattern-card">
                <div className="pattern-icon">🌊</div>
                <div className="pattern-content">
                  <h4>Volatilidade</h4>
                  <p>
                    {(analysis.patterns.volatility * 100).toFixed(0)}% de variação
                  </p>
                </div>
              </div>

              <div className="pattern-card">
                <div className="pattern-icon">📅</div>
                <div className="pattern-content">
                  <h4>Sazonalidade</h4>
                  <p>
                    {analysis.patterns.seasonality?.peakSeason || 'Não detectada'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && analysis.insights && (
          <div className="insights-content">
            <h3>💡 Insights Inteligentes</h3>
            <div className="insights-list">
              {analysis.insights.map((insight, index) => (
                <div key={index} className="insight-item">
                  <div className="insight-icon">💡</div>
                  <div className="insight-details">
                    <h4>{insight.title}</h4>
                    <p>{insight.description}</p>
                    {insight.tips && (
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
        )}

        {activeTab === 'recommendations' && analysis.recommendations && (
          <div className="recommendations-content">
            <h3>💰 Recomendações</h3>
            <div className="recommendations-list">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="rec-icon">💰</div>
                  <div className="rec-details">
                    <h4>{rec.category}</h4>
                    <p>{rec.tip}</p>
                    <div className="rec-meta">
                      <span className="rec-difficulty">{rec.difficulty}</span>
                      <span className="rec-saving">
                        Economia: {formatCurrency(rec.potential_saving || rec.potentialSaving)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && analysis.alerts && (
          <div className="alerts-content">
            <h3>⚠️ Alertas</h3>
            <div className="alerts-list">
              {analysis.alerts.map((alert, index) => (
                <div key={index} className="alert-item">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-details">
                    <h4>{alert.title}</h4>
                    <p>{alert.message || alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSection;
