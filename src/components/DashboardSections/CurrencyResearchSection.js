import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const CurrencyResearchSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('crypto');
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dados das moedas (simulados - em produção viria de uma API)
  const cryptoCurrencies = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 45000,
      change24h: 2.5,
      marketCap: '850B',
      volume: '25B',
      risk: 'Alto',
      liquidity: 'Alta',
      recommendation: 'Investimento de longo prazo para portfólios diversificados',
      pros: ['Líder de mercado', 'Aceitação crescente', 'Reserva de valor'],
      cons: ['Volatilidade alta', 'Regulamentação incerta', 'Consumo energético']
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3200,
      change24h: 1.8,
      marketCap: '385B',
      volume: '15B',
      risk: 'Alto',
      liquidity: 'Alta',
      recommendation: 'Boa para quem acredita na tecnologia blockchain',
      pros: ['Smart contracts', 'Ecosystema vasto', 'Upgrades constantes'],
      cons: ['Taxas de rede', 'Complexidade técnica', 'Concorrência']
    },
    {
      symbol: 'BNB',
      name: 'Binance Coin',
      price: 320,
      change24h: -0.5,
      marketCap: '48B',
      volume: '2B',
      risk: 'Médio-Alto',
      liquidity: 'Alta',
      recommendation: 'Útil se usar plataforma Binance frequentemente',
      pros: ['Desconto em taxas', 'Queima de tokens', 'Plataforma estabelecida'],
      cons: ['Dependente da Binance', 'Centralização', 'Regulamentação']
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.45,
      change24h: 3.2,
      marketCap: '15B',
      volume: '800M',
      risk: 'Alto',
      liquidity: 'Média',
      recommendation: 'Projeto acadêmico com potencial, mas ainda em desenvolvimento',
      pros: ['Abordagem científica', 'Sustentabilidade', 'Governança descentralizada'],
      cons: ['Desenvolvimento lento', 'Adoção limitada', 'Concorrência forte']
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 95,
      change24h: 4.1,
      marketCap: '40B',
      volume: '3B',
      risk: 'Alto',
      liquidity: 'Média',
      recommendation: 'Tecnologia promissora mas com riscos de centralização',
      pros: ['Transações rápidas', 'Taxas baixas', 'Ecosystema crescente'],
      cons: ['Histórico de instabilidade', 'Centralização', 'Concorrência']
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      price: 7.2,
      change24h: 1.5,
      marketCap: '8B',
      volume: '400M',
      risk: 'Alto',
      liquidity: 'Média',
      recommendation: 'Interoperabilidade é o futuro, mas projeto complexo',
      pros: ['Interoperabilidade', 'Parachains', 'Governança avançada'],
      cons: ['Complexidade', 'Adoção lenta', 'Concorrência']
    }
  ];

  const fiatCurrencies = [
    {
      symbol: 'USD',
      name: 'Dólar Americano',
      price: 0.92,
      change24h: 0.1,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Baixo',
      liquidity: 'Muito Alta',
      recommendation: 'Moeda de reserva mundial, estável para diversificação',
      pros: ['Moeda global', 'Estabilidade', 'Liquidez máxima'],
      cons: ['Inflação', 'Dependência política', 'Taxa de câmbio']
    },
    {
      symbol: 'EUR',
      name: 'Euro',
      price: 1.0,
      change24h: -0.2,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Baixo',
      liquidity: 'Muito Alta',
      recommendation: 'Moeda forte da UE, boa para europeus',
      pros: ['Zona Euro', 'Estabilidade', 'Facilidade de acesso'],
      cons: ['Crises regionais', 'Política monetária', 'Diversidade econômica']
    },
    {
      symbol: 'GBP',
      name: 'Libra Esterlina',
      price: 0.78,
      change24h: 0.3,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Médio',
      liquidity: 'Alta',
      recommendation: 'Historicamente forte, mas volatilidade pós-Brexit',
      pros: ['História longa', 'Estabilidade histórica', 'Centro financeiro'],
      cons: ['Volatilidade Brexit', 'Economia menor', 'Incerteza política']
    },
    {
      symbol: 'JPY',
      name: 'Iene Japonês',
      price: 135.5,
      change24h: -0.1,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Baixo',
      liquidity: 'Alta',
      recommendation: 'Moeda de refúgio em tempos de incerteza',
      pros: ['Moeda de refúgio', 'Estabilidade', 'Economia forte'],
      cons: ['Deflação', 'Envelhecimento populacional', 'Dívida pública']
    },
    {
      symbol: 'CHF',
      name: 'Franco Suíço',
      price: 0.88,
      change24h: 0.0,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Muito Baixo',
      liquidity: 'Alta',
      recommendation: 'Considerada uma das moedas mais seguras do mundo',
      pros: ['Neutralidade', 'Estabilidade', 'Qualidade institucional'],
      cons: ['Taxa de juros negativa', 'Custo elevado', 'Intervenção do banco central']
    },
    {
      symbol: 'CAD',
      name: 'Dólar Canadense',
      price: 1.25,
      change24h: 0.2,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Baixo',
      liquidity: 'Alta',
      recommendation: 'Moeda de commodity, boa para diversificação',
      pros: ['Recursos naturais', 'Estabilidade política', 'Proximidade com EUA'],
      cons: ['Dependência de commodities', 'Exposição ao petróleo', 'Economia menor']
    }
  ];

  const preciousMetals = [
    {
      symbol: 'XAU',
      name: 'Ouro',
      price: 1950,
      change24h: 0.5,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Baixo',
      liquidity: 'Alta',
      recommendation: 'Reserva de valor tradicional, proteção contra inflação',
      pros: ['Reserva de valor', 'Proteção inflação', 'História longa'],
      cons: ['Não gera rendimento', 'Custos de armazenamento', 'Volatilidade']
    },
    {
      symbol: 'XAG',
      name: 'Prata',
      price: 23.5,
      change24h: 1.2,
      marketCap: 'N/A',
      volume: 'N/A',
      risk: 'Médio',
      liquidity: 'Média',
      recommendation: 'Metal industrial e monetário, mais volátil que o ouro',
      pros: ['Uso industrial', 'Preço acessível', 'Potencial de crescimento'],
      cons: ['Maior volatilidade', 'Dependência industrial', 'Armazenamento']
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simular carregamento de dados
    setTimeout(() => {
      let data = [];
      switch (selectedCategory) {
        case 'crypto':
          data = cryptoCurrencies;
          break;
        case 'fiat':
          data = fiatCurrencies;
          break;
        case 'metals':
          data = preciousMetals;
          break;
        default:
          data = cryptoCurrencies;
      }
      setCurrencies(data);
      setLoading(false);
    }, 500);
  }, [selectedCategory]);

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Muito Baixo': return '#10b981';
      case 'Baixo': return '#34d399';
      case 'Médio': return '#fbbf24';
      case 'Médio-Alto': return '#f59e0b';
      case 'Alto': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  const formatPrice = (price, symbol) => {
    if (selectedCategory === 'crypto') {
      return `$${price.toLocaleString()}`;
    } else if (selectedCategory === 'fiat') {
      return `€${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  return (
    <div className="currency-research-section">
      <div className="section-header">
        <h1>🔍 Pesquisa de Moedas para Investimento</h1>
        <p>Análise detalhada de criptomoedas, moedas estrangeiras e metais preciosos</p>
      </div>

      {/* Filtros e Pesquisa */}
      <div className="research-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar por nome ou símbolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="category-tabs">
          <button
            className={`category-tab ${selectedCategory === 'crypto' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('crypto')}
          >
            🪙 Criptomoedas
          </button>
          <button
            className={`category-tab ${selectedCategory === 'fiat' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('fiat')}
          >
            💱 Moedas Estrangeiras
          </button>
          <button
            className={`category-tab ${selectedCategory === 'metals' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('metals')}
          >
            🥇 Metais Preciosos
          </button>
        </div>
      </div>

      {/* Grid de Moedas */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando dados das moedas...</p>
        </div>
      ) : (
        <div className="currencies-grid">
          {filteredCurrencies.map((currency, index) => (
            <div key={index} className="currency-card">
              <div className="currency-header">
                <div className="currency-info">
                  <h3>{currency.symbol}</h3>
                  <span className="currency-name">{currency.name}</span>
                </div>
                <div className="currency-price">
                  <span className="price">{formatPrice(currency.price, currency.symbol)}</span>
                  <span 
                    className={`change ${currency.change24h >= 0 ? 'positive' : 'negative'}`}
                    style={{ color: getChangeColor(currency.change24h) }}
                  >
                    {currency.change24h >= 0 ? '+' : ''}{currency.change24h}%
                  </span>
                </div>
              </div>

              <div className="currency-stats">
                <div className="stat-row">
                  <span className="label">Market Cap:</span>
                  <span className="value">{currency.marketCap}</span>
                </div>
                <div className="stat-row">
                  <span className="label">Volume 24h:</span>
                  <span className="value">{currency.volume}</span>
                </div>
                <div className="stat-row">
                  <span className="label">Risco:</span>
                  <span className="value" style={{ color: getRiskColor(currency.risk) }}>
                    {currency.risk}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="label">Liquidez:</span>
                  <span className="value">{currency.liquidity}</span>
                </div>
              </div>

              <div className="currency-recommendation">
                <h4>💡 Recomendação:</h4>
                <p>{currency.recommendation}</p>
              </div>

              <div className="currency-analysis">
                <div className="pros-cons">
                  <div className="pros">
                    <h5>✅ Vantagens:</h5>
                    <ul>
                      {currency.pros.map((pro, idx) => (
                        <li key={idx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons">
                    <h5>⚠️ Riscos:</h5>
                    <ul>
                      {currency.cons.map((con, idx) => (
                        <li key={idx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aviso de Risco */}
      <div className="risk-warning">
        <h3>⚠️ Aviso Importante</h3>
        <div className="warning-content">
          <p><strong>Investimentos em moedas digitais e estrangeiras envolvem riscos significativos:</strong></p>
          <ul>
            <li>💸 <strong>Perda Total:</strong> Você pode perder todo o dinheiro investido</li>
            <li>📊 <strong>Volatilidade:</strong> Preços podem variar drasticamente em pouco tempo</li>
            <li>🔒 <strong>Regulamentação:</strong> Mudanças na legislação podem afetar os investimentos</li>
            <li>🌐 <strong>Segurança:</strong> Riscos de hacking e perda de chaves privadas</li>
            <li>💰 <strong>Liquidez:</strong> Pode ser difícil vender em momentos de crise</li>
          </ul>
          <p><strong>Recomendação:</strong> Investa apenas o que pode perder e diversifique sempre o seu portfólio.</p>
        </div>
      </div>
    </div>
  );
};

export default CurrencyResearchSection;
