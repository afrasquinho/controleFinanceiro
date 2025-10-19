import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const AIInsightsSection = ({ gastosData, rendimentosData }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3meses');

  // Analisar padrões de gastos
  const analisePadroes = useMemo(() => {
    if (!gastosData || typeof gastosData !== 'object') return null;
    
    const todosGastos = Object.values(gastosData).flat().filter(gasto => 
      gasto && typeof gasto === 'object' && typeof gasto.valor === 'number'
    );
    
    if (todosGastos.length === 0) return null;

    // Análise por categoria
    const gastosPorCategoria = {};
    const gastosPorDia = {};
    const gastosPorValor = [];

    todosGastos.forEach(gasto => {
      const categoria = gasto.categoria || 'outros';
      const diaSemana = new Date(gasto.data).getDay();
      const valor = gasto.valor;

      // Por categoria
      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = { total: 0, count: 0, gastos: [] };
      }
      gastosPorCategoria[categoria].total += valor;
      gastosPorCategoria[categoria].count += 1;
      gastosPorCategoria[categoria].gastos.push(gasto);

      // Por dia da semana
      if (!gastosPorDia[diaSemana]) {
        gastosPorDia[diaSemana] = { total: 0, count: 0 };
      }
      gastosPorDia[diaSemana].total += valor;
      gastosPorDia[diaSemana].count += 1;

      gastosPorValor.push(valor);
    });

    // Calcular estatísticas
    const totalGastos = gastosPorValor.reduce((sum, val) => sum + val, 0);
    const mediaGastos = totalGastos / gastosPorValor.length;
    const gastosOrdenados = gastosPorValor.sort((a, b) => b - a);
    const mediana = gastosOrdenados[Math.floor(gastosOrdenados.length / 2)];

    // Encontrar categoria com maior gasto
    const categoriaMaiorGasto = Object.entries(gastosPorCategoria)
      .sort(([,a], [,b]) => b.total - a.total)[0];

    // Encontrar dia da semana com maior gasto
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaMaiorGasto = Object.entries(gastosPorDia)
      .sort(([,a], [,b]) => b.total - a.total)[0];

    return {
      totalGastos,
      mediaGastos,
      mediana,
      categoriaMaiorGasto,
      diaMaiorGasto: diaMaiorGasto ? [diasNomes[diaMaiorGasto[0]], diaMaiorGasto[1]] : null,
      gastosPorCategoria,
      gastosPorDia,
      totalTransacoes: todosGastos.length
    };
  }, [gastosData]);

  // Gerar insights inteligentes
  useEffect(() => {
    if (!analisePadroes) return;

    setLoading(true);
    
    // Simular processamento de IA (em produção seria uma API real)
    setTimeout(() => {
      const novosInsights = [];

      // Insight 1: Categoria com maior gasto
      if (analisePadroes.categoriaMaiorGasto) {
        const [categoria, dados] = analisePadroes.categoriaMaiorGasto;
        const percentual = (dados.total / analisePadroes.totalGastos) * 100;
        
        novosInsights.push({
          id: 'categoria-maior',
          tipo: 'warning',
          titulo: '🎯 Foco Principal de Gastos',
          descricao: `Você gasta ${percentual.toFixed(1)}% do seu orçamento em ${categoria}.`,
          valor: formatCurrency(dados.total),
          recomendacao: percentual > 40 ? 
            'Considere reduzir gastos nesta categoria para equilibrar seu orçamento.' :
            'Esta categoria representa uma parte significativa dos seus gastos.',
          acao: 'Revisar gastos nesta categoria'
        });
      }

      // Insight 2: Dia da semana com mais gastos
      if (analisePadroes.diaMaiorGasto) {
        const [dia, dados] = analisePadroes.diaMaiorGasto;
        const mediaPorDia = dados.total / dados.count;
        
        novosInsights.push({
          id: 'dia-maior',
          tipo: 'info',
          titulo: '📅 Padrão Semanal',
          descricao: `Você gasta mais nas ${dia}s, com uma média de ${formatCurrency(mediaPorDia)} por transação.`,
          valor: formatCurrency(dados.total),
          recomendacao: 'Considere planejar melhor suas compras para evitar gastos impulsivos.',
          acao: 'Planejar compras para outros dias'
        });
      }

      // Insight 3: Análise de valores
      const gastosAltos = analisePadroes.gastosPorValor.filter(valor => valor > analisePadroes.mediaGastos * 2);
      if (gastosAltos.length > 0) {
        novosInsights.push({
          id: 'gastos-altos',
          tipo: 'warning',
          titulo: '💰 Gastos Elevados Detectados',
          descricao: `Você tem ${gastosAltos.length} gastos acima de ${formatCurrency(analisePadroes.mediaGastos * 2)}.`,
          valor: formatCurrency(gastosAltos.reduce((sum, val) => sum + val, 0)),
          recomendacao: 'Revise estes gastos para identificar oportunidades de economia.',
          acao: 'Revisar gastos elevados'
        });
      }

      // Insight 4: Frequência de gastos
      const mediaGastosPorMes = analisePadroes.totalGastos / Math.max(1, Object.keys(gastosData).length);
      if (analisePadroes.totalTransacoes > 50) {
        novosInsights.push({
          id: 'frequencia-alta',
          tipo: 'info',
          titulo: '📊 Frequência de Transações',
          descricao: `Você faz em média ${(analisePadroes.totalTransacoes / Math.max(1, Object.keys(gastosData).length)).toFixed(1)} transações por mês.`,
          valor: formatCurrency(mediaGastosPorMes),
          recomendacao: 'Considere consolidar algumas compras para reduzir taxas e economizar tempo.',
          acao: 'Consolidar compras'
        });
      }

      // Insight 5: Análise de tendência
      const meses = Object.keys(gastosData).sort();
      if (meses.length >= 2) {
        const gastosMesAnterior = Object.values(gastosData[meses[meses.length - 2]] || []).reduce((sum, gasto) => sum + gasto.valor, 0);
        const gastosMesAtual = Object.values(gastosData[meses[meses.length - 1]] || []).reduce((sum, gasto) => sum + gasto.valor, 0);
        const variacao = gastosMesAnterior > 0 ? ((gastosMesAtual - gastosMesAnterior) / gastosMesAnterior) * 100 : 0;

        if (Math.abs(variacao) > 15) {
          novosInsights.push({
            id: 'tendencia',
            tipo: variacao > 0 ? 'warning' : 'success',
            titulo: variacao > 0 ? '📈 Tendência de Aumento' : '📉 Tendência de Redução',
            descricao: `Seus gastos ${variacao > 0 ? 'aumentaram' : 'diminuíram'} ${Math.abs(variacao).toFixed(1)}% em relação ao mês anterior.`,
            valor: formatCurrency(Math.abs(gastosMesAtual - gastosMesAnterior)),
            recomendacao: variacao > 0 ? 
              'Mantenha o controle para evitar corte no orçamento.' :
              'Parabéns! Continue mantendo este controle financeiro.',
            acao: variacao > 0 ? 'Revisar orçamento' : 'Manter disciplina'
          });
        }
      }

      // Insight 6: Oportunidade de economia
      const categoriaMaior = analisePadroes.categoriaMaiorGasto;
      if (categoriaMaior && categoriaMaior[1].total > analisePadroes.totalGastos * 0.3) {
        novosInsights.push({
          id: 'oportunidade',
          tipo: 'success',
          titulo: '💡 Oportunidade de Economia',
          descricao: `Reduzir 10% dos gastos em ${categoriaMaior[0]} economizaria ${formatCurrency(categoriaMaior[1].total * 0.1)}.`,
          valor: formatCurrency(categoriaMaior[1].total * 0.1),
          recomendacao: 'Considere alternativas mais econômicas ou reduza a frequência.',
          acao: 'Buscar alternativas mais baratas'
        });
      }

      setInsights(novosInsights);
      setLoading(false);
    }, 1000);
  }, [analisePadroes, gastosData]);

  const getInsightIcon = (tipo) => {
    switch (tipo) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '💡';
    }
  };

  const getInsightColor = (tipo) => {
    switch (tipo) {
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="ai-insights-section">
      <div className="section-header">
        <h1>🤖 Insights de IA Avançada</h1>
        <p>Análise inteligente dos seus padrões de gastos e recomendações personalizadas</p>
      </div>

      {/* Filtros de Tempo */}
      <div className="timeframe-filters">
        <label>Período de Análise:</label>
        <div className="timeframe-buttons">
          {[
            { id: '1mes', label: '1 Mês' },
            { id: '3meses', label: '3 Meses' },
            { id: '6meses', label: '6 Meses' },
            { id: 'todos', label: 'Todos os Dados' }
          ].map(timeframe => (
            <button
              key={timeframe.id}
              className={`timeframe-btn ${selectedTimeframe === timeframe.id ? 'active' : ''}`}
              onClick={() => setSelectedTimeframe(timeframe.id)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo Estatístico */}
      {analisePadroes && (
        <div className="stats-overview">
          <h3>📊 Resumo Estatístico</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Total Gasto</div>
                <div className="stat-value">{formatCurrency(analisePadroes.totalGastos)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Média por Gasto</div>
                <div className="stat-value">{formatCurrency(analisePadroes.mediaGastos)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Mediana</div>
                <div className="stat-value">{formatCurrency(analisePadroes.mediana)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <div className="stat-label">Total Transações</div>
                <div className="stat-value">{analisePadroes.totalTransacoes}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights de IA */}
      <div className="insights-container">
        <h3>🧠 Insights Inteligentes</h3>
        {loading ? (
          <div className="loading-insights">
            <div className="loading-spinner"></div>
            <p>Analisando seus dados com IA...</p>
          </div>
        ) : insights.length > 0 ? (
          <div className="insights-grid">
            {insights.map(insight => (
              <div key={insight.id} className="insight-card" style={{ borderLeftColor: getInsightColor(insight.tipo) }}>
                <div className="insight-header">
                  <div className="insight-icon">{getInsightIcon(insight.tipo)}</div>
                  <div className="insight-title">{insight.titulo}</div>
                  <div className="insight-value">{insight.valor}</div>
                </div>
                <div className="insight-body">
                  <p className="insight-description">{insight.descricao}</p>
                  <div className="insight-recommendation">
                    <strong>💡 Recomendação:</strong> {insight.recomendacao}
                  </div>
                  <div className="insight-action">
                    <strong>🎯 Ação Sugerida:</strong> {insight.acao}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-insights">
            <div className="no-insights-icon">📝</div>
            <h4>Adicione mais dados</h4>
            <p>Para receber insights personalizados, adicione mais gastos e transações.</p>
          </div>
        )}
      </div>

      {/* Recomendações Personalizadas */}
      <div className="recommendations-section">
        <h3>🎯 Recomendações Personalizadas</h3>
        <div className="recommendations-grid">
          <div className="recommendation-card">
            <div className="rec-icon">💳</div>
            <div className="rec-content">
              <h4>Cartão de Crédito Inteligente</h4>
              <p>Considere um cartão que ofereça cashback em suas categorias de maior gasto.</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">📱</div>
            <div className="rec-content">
              <h4>App de Controle</h4>
              <p>Use notificações automáticas para alertas de orçamento em tempo real.</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">🎯</div>
            <div className="rec-content">
              <h4>Metas Mensais</h4>
              <p>Defina limites específicos por categoria baseados no seu histórico.</p>
            </div>
          </div>
          <div className="recommendation-card">
            <div className="rec-icon">📊</div>
            <div className="rec-content">
              <h4>Análise Semanal</h4>
              <p>Revise seus gastos toda semana para manter o controle.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsSection;
