import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const ExpensesComparisonSection = ({ gastosData, gastosFixos }) => {
  const [selectedMonths, setSelectedMonths] = useState(['01', '02']);
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Categorias para análise
  const categorias = useMemo(() => ({
    'alimentacao': { nome: '🍽️ Alimentação', cor: '#ff6b6b' },
    'transporte': { nome: '🚗 Transporte', cor: '#4ecdc4' },
    'saude': { nome: '🏥 Saúde', cor: '#45b7d1' },
    'educacao': { nome: '📚 Educação', cor: '#96ceb4' },
    'lazer': { nome: '🎬 Lazer', cor: '#feca57' },
    'casa': { nome: '🏠 Casa', cor: '#ff9ff3' },
    'vestuario': { nome: '👕 Vestuário', cor: '#54a0ff' },
    'outros': { nome: '📦 Outros', cor: '#5f27cd' }
  }), []);

  const mesesNomes = useMemo(() => ({
    '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
    '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
    '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  }), []);

  // Analisar gastos por mês e categoria
  const analiseMensal = useMemo(() => {
    const analise = {};
    
    Object.entries(gastosData).forEach(([mesId, gastos]) => {
      if (!gastos || gastos.length === 0) return;
      
      const gastosPorCategoria = {};
      let totalVariaveis = 0;
      
      gastos.forEach(gasto => {
        const categoria = gasto.categoria || 'outros';
        if (!gastosPorCategoria[categoria]) {
          gastosPorCategoria[categoria] = 0;
        }
        gastosPorCategoria[categoria] += gasto.valor;
        totalVariaveis += gasto.valor;
      });
      
      // Adicionar gastos fixos se disponíveis
      let totalFixos = 0;
      if (gastosFixos && gastosFixos[mesId]) {
        totalFixos = Object.values(gastosFixos[mesId]).reduce((sum, valor) => sum + valor, 0);
      }
      
      analise[mesId] = {
        mesNome: mesesNomes[mesId],
        gastosPorCategoria,
        totalVariaveis,
        totalFixos,
        totalGeral: totalVariaveis + totalFixos,
        quantidadeGastos: gastos.length
      };
    });
    
    return analise;
  }, [gastosData, gastosFixos, mesesNomes]);

  // Calcular comparação entre meses
  const comparacao = useMemo(() => {
    if (selectedMonths.length < 2) return null;
    
    const [mes1, mes2] = selectedMonths;
    const dadosMes1 = analiseMensal[mes1];
    const dadosMes2 = analiseMensal[mes2];
    
    if (!dadosMes1 || !dadosMes2) return null;
    
    const diferencaTotal = dadosMes2.totalGeral - dadosMes1.totalGeral;
    const percentualVariacao = dadosMes1.totalGeral > 0 
      ? ((diferencaTotal / dadosMes1.totalGeral) * 100) 
      : 0;
    
    // Comparação por categoria
    const comparacaoCategorias = {};
    Object.keys(categorias).forEach(categoria => {
      const valorMes1 = dadosMes1.gastosPorCategoria[categoria] || 0;
      const valorMes2 = dadosMes2.gastosPorCategoria[categoria] || 0;
      const diferenca = valorMes2 - valorMes1;
      const percentual = valorMes1 > 0 ? ((diferenca / valorMes1) * 100) : 0;
      
      comparacaoCategorias[categoria] = {
        mes1: valorMes1,
        mes2: valorMes2,
        diferenca,
        percentual
      };
    });
    
    return {
      mes1: dadosMes1,
      mes2: dadosMes2,
      diferencaTotal,
      percentualVariacao,
      comparacaoCategorias
    };
  }, [selectedMonths, analiseMensal, categorias]);

  // Filtrar dados por categoria selecionada
  const dadosFiltrados = useMemo(() => {
    if (selectedCategory === 'todas') return analiseMensal;
    
    const filtrados = {};
    Object.entries(analiseMensal).forEach(([mesId, dados]) => {
      filtrados[mesId] = {
        ...dados,
        gastosPorCategoria: {
          [selectedCategory]: dados.gastosPorCategoria[selectedCategory] || 0
        },
        totalVariaveis: dados.gastosPorCategoria[selectedCategory] || 0,
        totalGeral: (dados.gastosPorCategoria[selectedCategory] || 0) + (selectedCategory === 'casa' ? dados.totalFixos : 0)
      };
    });
    
    return filtrados;
  }, [analiseMensal, selectedCategory]);

  const getVariacaoColor = (percentual) => {
    if (percentual > 10) return '#ef4444'; // Vermelho - aumento significativo
    if (percentual > 0) return '#f59e0b';  // Amarelo - aumento moderado
    if (percentual < -10) return '#10b981'; // Verde - redução significativa
    if (percentual < 0) return '#34d399';   // Verde claro - redução moderada
    return '#6b7280'; // Cinza - sem variação
  };

  const getVariacaoIcon = (percentual) => {
    if (percentual > 0) return '📈';
    if (percentual < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="expenses-comparison-section">
      <div className="section-header">
        <h1>📊 Comparação de Gastos Mensais</h1>
        <p>Analise e compare seus gastos entre diferentes meses e categorias</p>
      </div>

      {/* Filtros */}
      <div className="comparison-filters">
        <div className="filter-group">
          <label>Meses para Comparar:</label>
          <div className="month-selector">
            {Object.entries(mesesNomes).map(([mesId, mesNome]) => (
              <label key={mesId} className="month-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(mesId)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMonths([...selectedMonths, mesId]);
                    } else {
                      setSelectedMonths(selectedMonths.filter(id => id !== mesId));
                    }
                  }}
                />
                <span>{mesNome}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Categoria:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="todas">Todas as Categorias</option>
            {Object.entries(categorias).map(([id, categoria]) => (
              <option key={id} value={id}>{categoria.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo da Comparação */}
      {comparacao && (
        <div className="comparison-summary">
          <h3>📈 Resumo da Comparação</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">{comparacao.mes1.mesNome}</span>
                <span className="card-period">Mês 1</span>
              </div>
              <div className="card-value">{formatCurrency(comparacao.mes1.totalGeral)}</div>
              <div className="card-details">
                <span>{comparacao.mes1.quantidadeGastos} gastos</span>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-header">
                <span className="card-title">{comparacao.mes2.mesNome}</span>
                <span className="card-period">Mês 2</span>
              </div>
              <div className="card-value">{formatCurrency(comparacao.mes2.totalGeral)}</div>
              <div className="card-details">
                <span>{comparacao.mes2.quantidadeGastos} gastos</span>
              </div>
            </div>

            <div className="summary-card variation">
              <div className="card-header">
                <span className="card-title">Variação</span>
                <span className="card-period">Diferença</span>
              </div>
              <div 
                className="card-value" 
                style={{ color: getVariacaoColor(comparacao.percentualVariacao) }}
              >
                {getVariacaoIcon(comparacao.percentualVariacao)} {formatCurrency(Math.abs(comparacao.diferencaTotal))}
              </div>
              <div 
                className="card-details"
                style={{ color: getVariacaoColor(comparacao.percentualVariacao) }}
              >
                {comparacao.percentualVariacao > 0 ? '+' : ''}{comparacao.percentualVariacao.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparação por Categoria */}
      {comparacao && selectedCategory === 'todas' && (
        <div className="category-comparison">
          <h3>📋 Comparação por Categoria</h3>
          <div className="category-grid">
            {Object.entries(comparacao.comparacaoCategorias).map(([categoriaId, dados]) => {
              const categoria = categorias[categoriaId];
              return (
                <div key={categoriaId} className="category-comparison-card">
                  <div className="category-header">
                    <span 
                      className="category-icon"
                      style={{ backgroundColor: categoria.cor }}
                    >
                      {categoria.nome}
                    </span>
                  </div>
                  
                  <div className="category-values">
                    <div className="value-row">
                      <span className="label">{comparacao.mes1.mesNome}:</span>
                      <span className="value">{formatCurrency(dados.mes1)}</span>
                    </div>
                    <div className="value-row">
                      <span className="label">{comparacao.mes2.mesNome}:</span>
                      <span className="value">{formatCurrency(dados.mes2)}</span>
                    </div>
                    <div className="value-row variation">
                      <span className="label">Diferença:</span>
                      <span 
                        className="value"
                        style={{ color: getVariacaoColor(dados.percentual) }}
                      >
                        {getVariacaoIcon(dados.percentual)} {formatCurrency(Math.abs(dados.diferenca))}
                      </span>
                    </div>
                    <div className="percentage-row">
                      <span 
                        className="percentage"
                        style={{ color: getVariacaoColor(dados.percentual) }}
                      >
                        {dados.percentual > 0 ? '+' : ''}{dados.percentual.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gráfico de Tendências */}
      <div className="trends-section">
        <h3>📈 Tendências Mensais</h3>
        <div className="trends-chart">
          {Object.entries(dadosFiltrados).map(([mesId, dados]) => {
            const maxValor = Math.max(...Object.values(dadosFiltrados).map(d => d.totalGeral));
            const altura = maxValor > 0 ? (dados.totalGeral / maxValor) * 100 : 0;
            
            return (
              <div key={mesId} className="trend-bar">
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ 
                      height: `${altura}%`,
                      backgroundColor: selectedCategory === 'todas' ? '#3b82f6' : categorias[selectedCategory]?.cor
                    }}
                  ></div>
                </div>
                <div className="bar-label">
                  <span className="month">{dados.mesNome}</span>
                  <span className="value">{formatCurrency(dados.totalGeral)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Automáticos */}
      <div className="insights-section">
        <h3>💡 Insights Automáticos</h3>
        <div className="insights-grid">
          {comparacao && (
            <>
              {comparacao.percentualVariacao > 20 && (
                <div className="insight-card warning">
                  <div className="insight-icon">⚠️</div>
                  <div className="insight-content">
                    <h4>Aumento Significativo</h4>
                    <p>Seus gastos aumentaram {comparacao.percentualVariacao.toFixed(1)}% em relação ao mês anterior.</p>
                  </div>
                </div>
              )}
              
              {comparacao.percentualVariacao < -20 && (
                <div className="insight-card success">
                  <div className="insight-icon">✅</div>
                  <div className="insight-content">
                    <h4>Redução Significativa</h4>
                    <p>Parabéns! Você reduziu seus gastos em {Math.abs(comparacao.percentualVariacao).toFixed(1)}%.</p>
                  </div>
                </div>
              )}
              
              {Object.entries(comparacao.comparacaoCategorias).some(([_, dados]) => dados.percentual > 50) && (
                <div className="insight-card info">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <h4>Categoria em Alta</h4>
                    <p>Algumas categorias tiveram aumento significativo. Revise seus gastos.</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          {Object.keys(analiseMensal).length === 0 && (
            <div className="insight-card">
              <div className="insight-icon">📝</div>
              <div className="insight-content">
                <h4>Comece a Registrar</h4>
                <p>Adicione gastos para ver análises e comparações automáticas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpensesComparisonSection;
