import React, { useState, useEffect } from 'react';

const CurrencyResearch = () => {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de moedas com informações de investimento
  const currencyData = [
    {
      id: 'USD',
      name: 'Dólar Americano',
      symbol: '$',
      flag: '🇺🇸',
      description: 'Moeda de reserva mundial, estável e amplamente aceita',
      strength: 'Alta',
      volatility: 'Baixa',
      interestRate: '5.25%',
      trend: 'Estável',
      recommendation: 'Excelente para preservação de capital',
      pros: ['Estabilidade', 'Liquidez alta', 'Aceitação global'],
      cons: ['Baixo rendimento', 'Inflação americana'],
      bestFor: 'Curto a médio prazo',
      riskLevel: 'Baixo'
    },
    {
      id: 'EUR',
      name: 'Euro',
      symbol: '€',
      flag: '🇪🇺',
      description: 'Moeda da zona euro, segunda maior reserva mundial',
      strength: 'Alta',
      volatility: 'Baixa',
      interestRate: '4.25%',
      trend: 'Estável',
      recommendation: 'Boa opção para europeus',
      pros: ['Estabilidade', 'Facilidade de acesso', 'Baixo risco'],
      cons: ['Crescimento lento', 'Dependência da economia europeia'],
      bestFor: 'Médio prazo',
      riskLevel: 'Baixo'
    },
    {
      id: 'GBP',
      name: 'Libra Esterlina',
      symbol: '£',
      flag: '🇬🇧',
      description: 'Moeda do Reino Unido, tradicional e estável',
      strength: 'Média',
      volatility: 'Média',
      interestRate: '5.25%',
      trend: 'Volátil',
      recommendation: 'Cuidado com volatilidade Brexit',
      pros: ['Histórico estável', 'Bancos sólidos', 'Rendimento atrativo'],
      cons: ['Volatilidade política', 'Incerteza Brexit'],
      bestFor: 'Investidores experientes',
      riskLevel: 'Médio'
    },
    {
      id: 'CHF',
      name: 'Franco Suíço',
      symbol: 'CHF',
      flag: '🇨🇭',
      description: 'Moeda de refúgio, conhecida por sua estabilidade',
      strength: 'Muito Alta',
      volatility: 'Muito Baixa',
      interestRate: '1.75%',
      trend: 'Estável',
      recommendation: 'Excelente para proteção de capital',
      pros: ['Estabilidade máxima', 'Refúgio seguro', 'Inflação baixa'],
      cons: ['Rendimento baixo', 'Custo de conversão'],
      bestFor: 'Preservação de capital',
      riskLevel: 'Muito Baixo'
    },
    {
      id: 'JPY',
      name: 'Iene Japonês',
      symbol: '¥',
      flag: '🇯🇵',
      description: 'Moeda de refúgio asiático, baixa volatilidade',
      strength: 'Alta',
      volatility: 'Baixa',
      interestRate: '-0.10%',
      trend: 'Deflacionário',
      recommendation: 'Atenção às taxas negativas',
      pros: ['Estabilidade', 'Refúgio seguro', 'Economia forte'],
      cons: ['Taxas negativas', 'Crescimento lento'],
      bestFor: 'Proteção contra crises',
      riskLevel: 'Baixo'
    },
    {
      id: 'CAD',
      name: 'Dólar Canadense',
      symbol: 'C$',
      flag: '🇨🇦',
      description: 'Moeda de commodity, ligada ao petróleo',
      strength: 'Média',
      volatility: 'Média',
      interestRate: '5.00%',
      trend: 'Cíclico',
      recommendation: 'Boa para diversificação',
      pros: ['Rendimento atrativo', 'Recursos naturais', 'Economia sólida'],
      cons: ['Dependência do petróleo', 'Volatilidade cíclica'],
      bestFor: 'Diversificação de portfolio',
      riskLevel: 'Médio'
    },
    {
      id: 'AUD',
      name: 'Dólar Australiano',
      symbol: 'A$',
      flag: '🇦🇺',
      description: 'Moeda de commodity, alta volatilidade',
      strength: 'Média',
      volatility: 'Alta',
      interestRate: '4.35%',
      trend: 'Volátil',
      recommendation: 'Alto risco, alto retorno',
      pros: ['Rendimento alto', 'Recursos naturais', 'Crescimento'],
      cons: ['Alta volatilidade', 'Dependência de commodities'],
      bestFor: 'Investidores tolerantes ao risco',
      riskLevel: 'Alto'
    },
    {
      id: 'NZD',
      name: 'Dólar Neozelandês',
      symbol: 'NZ$',
      flag: '🇳🇿',
      description: 'Moeda de commodity, economia agrícola',
      strength: 'Média',
      volatility: 'Alta',
      interestRate: '5.50%',
      trend: 'Volátil',
      recommendation: 'Alto rendimento, alto risco',
      pros: ['Rendimento muito alto', 'Economia estável', 'Baixa dívida'],
      cons: ['Alta volatilidade', 'Economia pequena'],
      bestFor: 'Investidores experientes',
      riskLevel: 'Alto'
    }
  ];

  useEffect(() => {
    setCurrencies(currencyData);
  }, []);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Muito Baixo': return '#10b981';
      case 'Baixo': return '#34d399';
      case 'Médio': return '#fbbf24';
      case 'Alto': return '#f59e0b';
      case 'Muito Alto': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'Alta': return '#10b981';
      case 'Estável': return '#3b82f6';
      case 'Volátil': return '#f59e0b';
      case 'Deflacionário': return '#ef4444';
      case 'Cíclico': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Muito Alta': return '#10b981';
      case 'Alta': return '#34d399';
      case 'Média': return '#fbbf24';
      case 'Baixa': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="currency-research">
      <div className="research-header">
        <h3>🌍 Pesquisa de Moedas para Investimento</h3>
        <p>Compare moedas e encontre as melhores oportunidades de investimento</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Pesquisar moeda (ex: USD, Euro, Dólar...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
      </div>

      {/* Currency Grid */}
      <div className="currency-grid">
        {filteredCurrencies.map(currency => (
          <div 
            key={currency.id} 
            className={`currency-card ${selectedCurrency?.id === currency.id ? 'selected' : ''}`}
            onClick={() => setSelectedCurrency(currency)}
          >
            <div className="currency-header">
              <div className="currency-info">
                <div className="currency-flag">{currency.flag}</div>
                <div className="currency-details">
                  <h4>{currency.name}</h4>
                  <span className="currency-code">{currency.id}</span>
                </div>
              </div>
              <div className="currency-symbol">{currency.symbol}</div>
            </div>

            <div className="currency-metrics">
              <div className="metric">
                <span className="metric-label">Taxa de Juro</span>
                <span className="metric-value positive">{currency.interestRate}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Força</span>
                <span 
                  className="metric-value" 
                  style={{ color: getStrengthColor(currency.strength) }}
                >
                  {currency.strength}
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Volatilidade</span>
                <span 
                  className="metric-value" 
                  style={{ color: getRiskColor(currency.volatility) }}
                >
                  {currency.volatility}
                </span>
              </div>
            </div>

            <div className="currency-trend">
              <span className="trend-label">Tendência:</span>
              <span 
                className="trend-value" 
                style={{ color: getTrendColor(currency.trend) }}
              >
                {currency.trend}
              </span>
            </div>

            <div className="currency-recommendation">
              <p>{currency.recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedCurrency && (
        <div className="currency-detail-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {selectedCurrency.flag} {selectedCurrency.name} ({selectedCurrency.id})
              </h3>
              <button 
                className="close-button"
                onClick={() => setSelectedCurrency(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-description">
                <p>{selectedCurrency.description}</p>
              </div>

              <div className="detail-metrics">
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Taxa de Juro</h4>
                    <span className="metric-value-large positive">
                      {selectedCurrency.interestRate}
                    </span>
                  </div>
                  <div className="metric-card">
                    <h4>Nível de Risco</h4>
                    <span 
                      className="metric-value-large"
                      style={{ color: getRiskColor(selectedCurrency.riskLevel) }}
                    >
                      {selectedCurrency.riskLevel}
                    </span>
                  </div>
                  <div className="metric-card">
                    <h4>Melhor Para</h4>
                    <span className="metric-value-large">
                      {selectedCurrency.bestFor}
                    </span>
                  </div>
                  <div className="metric-card">
                    <h4>Tendência Atual</h4>
                    <span 
                      className="metric-value-large"
                      style={{ color: getTrendColor(selectedCurrency.trend) }}
                    >
                      {selectedCurrency.trend}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-pros-cons">
                <div className="pros-section">
                  <h4>✅ Vantagens</h4>
                  <ul>
                    {selectedCurrency.pros.map((pro, index) => (
                      <li key={index}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="cons-section">
                  <h4>❌ Desvantagens</h4>
                  <ul>
                    {selectedCurrency.cons.map((con, index) => (
                      <li key={index}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="investment-advice">
                <h4>💡 Conselho de Investimento</h4>
                <p className="advice-text">{selectedCurrency.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="quick-tips">
        <h4>💡 Dicas Rápidas para Investimento em Moedas</h4>
        <div className="tips-list">
          <div className="tip-item">
            <strong>Diversificação:</strong> Nunca coloque tudo numa só moeda
          </div>
          <div className="tip-item">
            <strong>Taxa de Câmbio:</strong> Considere sempre os custos de conversão
          </div>
          <div className="tip-item">
            <strong>Timing:</strong> Moedas são voláteis, invista com calma
          </div>
          <div className="tip-item">
            <strong>Objetivo:</strong> Defina se quer preservar ou crescer capital
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyResearch;
