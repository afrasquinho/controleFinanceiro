import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { formatCurrency } from '../../utils/calculations.js';

const ChartsSection = ({ gastosData, gastosFixos }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedChart, setSelectedChart] = useState('trends');

  // Função auxiliar para nome do mês
  const getMonthName = (monthNumber) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[monthNumber - 1] || '';
  };

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

  // Obter dados baseado no período selecionado
  const getDataForPeriod = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getYear() + 1900;
    
    let monthsToShow = [];
    
    switch (selectedPeriod) {
      case '3months':
        monthsToShow = Array.from({ length: 3 }, (_, i) => {
          const month = currentMonth - i;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          return {
            id: (month <= 0 ? month + 12 : month).toString().padStart(2, '0'),
            year: year,
            name: getMonthName(month <= 0 ? month + 12 : month)
          };
        }).reverse();
        break;
      case '6months':
        monthsToShow = Array.from({ length: 6 }, (_, i) => {
          const month = currentMonth - i;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          return {
            id: (month <= 0 ? month + 12 : month).toString().padStart(2, '0'),
            year: year,
            name: getMonthName(month <= 0 ? month + 12 : month)
          };
        }).reverse();
        break;
      case '12months':
        monthsToShow = Array.from({ length: 12 }, (_, i) => {
          const month = currentMonth - i;
          const year = month <= 0 ? currentYear - 1 : currentYear;
          return {
            id: (month <= 0 ? month + 12 : month).toString().padStart(2, '0'),
            year: year,
            name: getMonthName(month <= 0 ? month + 12 : month)
          };
        }).reverse();
        break;
      default:
        monthsToShow = [];
    }

    return monthsToShow;
  }, [selectedPeriod]);

  // Processar dados para gráficos
  const chartData = useMemo(() => {
    const data = {
      trends: [],
      categories: {},
      weekly: {},
      heatmap: []
    };

    // Dados de tendências mensais
    getDataForPeriod.forEach(month => {
      const gastos = gastosData[month.id] || [];
      const gastosFixosMes = gastosFixos[month.id] || {};
      
      let totalVariaveis = 0;
      let totalFixos = 0;
      const gastosPorCategoria = {};

      // Processar gastos variáveis
      gastos.forEach(gasto => {
        const categoria = gasto.categoria || 'outros';
        if (!gastosPorCategoria[categoria]) gastosPorCategoria[categoria] = 0;
        gastosPorCategoria[categoria] += gasto.valor;
        totalVariaveis += gasto.valor;
      });

      // Processar gastos fixos
      Object.values(gastosFixosMes).forEach(valor => {
        totalFixos += valor;
      });

      data.trends.push({
        month: month.name,
        monthId: month.id,
        total: totalVariaveis + totalFixos,
        variaveis: totalVariaveis,
        fixos: totalFixos,
        categorias: gastosPorCategoria
      });

      // Agregar por categoria
      Object.entries(gastosPorCategoria).forEach(([categoria, valor]) => {
        if (!data.categories[categoria]) {
          data.categories[categoria] = [];
        }
        data.categories[categoria].push({
          month: month.name,
          value: valor
        });
      });
    });

    // Dados de heatmap semanal (últimos 3 meses)
    const last3Months = getDataForPeriod.slice(-3);
    last3Months.forEach(month => {
      const gastos = gastosData[month.id] || [];
      const weeklyData = {};

      gastos.forEach(gasto => {
        if (gasto.data) {
          const date = new Date(gasto.data);
          const week = Math.ceil(date.getDate() / 7);
          if (!weeklyData[week]) weeklyData[week] = 0;
          weeklyData[week] += gasto.valor;
        }
      });

      data.heatmap.push({
        month: month.name,
        monthId: month.id,
        weeks: weeklyData
      });
    });

    return data;
  }, [gastosData, gastosFixos, getDataForPeriod]);

  // Calcular estatísticas
  const statistics = useMemo(() => {
    const trends = chartData.trends;
    if (trends.length === 0) return null;

    const values = trends.map(t => t.total);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calcular tendência
    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';

    return {
      maxValue,
      minValue,
      avgValue,
      trend,
      trendPercentage: firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg * 100) : 0
    };
  }, [chartData]);

  // Renderizar gráfico de tendências
  const renderTrendsChart = () => {
    const chartDataForRecharts = chartData.trends.map(month => ({
      name: month.name,
      total: month.total,
      variaveis: month.variaveis,
      fixos: month.fixos
    }));
    
    return (
      <div className="trends-chart">
        <div className="chart-header">
          <h3>📈 Tendências de Gastos</h3>
          <div className="chart-stats">
            {statistics && (
              <>
                <div className="stat-item">
                  <span className="label">Média:</span>
                  <span className="value">{formatCurrency(statistics.avgValue)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Tendência:</span>
                  <span className={`value trend-${statistics.trend}`}>
                    {statistics.trend === 'up' ? '📈' : statistics.trend === 'down' ? '📉' : '➡️'}
                    {Math.abs(statistics.trendPercentage).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartDataForRecharts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="variaveis" stackId="a" fill="#ff6b6b" name="Gastos Variáveis" />
              <Bar dataKey="fixos" stackId="a" fill="#4ecdc4" name="Gastos Fixos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Renderizar gráfico de linha para tendências
  const renderLineChart = () => {
    const chartDataForRecharts = chartData.trends.map(month => ({
      name: month.name,
      total: month.total,
      variaveis: month.variaveis,
      fixos: month.fixos
    }));
    
    return (
      <div className="line-chart">
        <div className="chart-header">
          <h3>📈 Evolução dos Gastos</h3>
          <div className="chart-stats">
            {statistics && (
              <>
                <div className="stat-item">
                  <span className="label">Média:</span>
                  <span className="value">{formatCurrency(statistics.avgValue)}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Tendência:</span>
                  <span className={`value trend-${statistics.trend}`}>
                    {statistics.trend === 'up' ? '📈' : statistics.trend === 'down' ? '📉' : '➡️'}
                    {Math.abs(statistics.trendPercentage).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartDataForRecharts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={3} name="Total" />
              <Line type="monotone" dataKey="variaveis" stroke="#ff6b6b" strokeWidth={2} name="Gastos Variáveis" />
              <Line type="monotone" dataKey="fixos" stroke="#4ecdc4" strokeWidth={2} name="Gastos Fixos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Renderizar gráfico de categorias
  const renderCategoriesChart = () => {
    const categoryTotals = {};
    
    chartData.trends.forEach(month => {
      Object.entries(month.categorias).forEach(([categoria, valor]) => {
        if (!categoryTotals[categoria]) categoryTotals[categoria] = 0;
        categoryTotals[categoria] += valor;
      });
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8); // Top 8 categorias

    const chartDataForRecharts = sortedCategories.map(([categoria, valor]) => {
      const categoriaInfo = categorias[categoria];
      return {
        name: categoriaInfo?.nome || categoria,
        value: valor,
        color: categoriaInfo?.cor || '#6b7280'
      };
    });

    return (
      <div className="categories-chart">
        <h3>📊 Gastos por Categoria</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartDataForRecharts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#8884d8">
                {chartDataForRecharts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Renderizar heatmap semanal
  const renderWeeklyHeatmap = () => {
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const maxValue = Math.max(...chartData.heatmap.flatMap(month => 
      Object.values(month.weeks)
    ));

    return (
      <div className="weekly-heatmap">
        <h3>🔥 Heatmap Semanal</h3>
        <div className="heatmap-container">
          <div className="heatmap-grid">
            {chartData.heatmap.map(month => (
              <div key={month.monthId} className="month-column">
                <div className="month-header">{month.month}</div>
                <div className="weeks-grid">
                  {weeks.map((week, weekIndex) => {
                    const value = month.weeks[weekIndex + 1] || 0;
                    const intensity = maxValue > 0 ? (value / maxValue) : 0;
                    return (
                      <div 
                        key={weekIndex}
                        className={`week-cell intensity-${Math.floor(intensity * 4)}`}
                        title={`${week}: ${formatCurrency(value)}`}
                      >
                        <span className="week-value">{formatCurrency(value)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Menos</span>
            <div className="legend-scale">
              <div className="scale-item intensity-0"></div>
              <div className="scale-item intensity-1"></div>
              <div className="scale-item intensity-2"></div>
              <div className="scale-item intensity-3"></div>
            </div>
            <span>Mais</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar gráfico de pizza
  const renderPieChart = () => {
    const categoryTotals = {};
    
    chartData.trends.forEach(month => {
      Object.entries(month.categorias).forEach(([categoria, valor]) => {
        if (!categoryTotals[categoria]) categoryTotals[categoria] = 0;
        categoryTotals[categoria] += valor;
      });
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a);

    const chartDataForRecharts = sortedCategories.map(([categoria, valor]) => {
      const categoriaInfo = categorias[categoria];
      return {
        name: categoriaInfo?.nome || categoria,
        value: valor,
        color: categoriaInfo?.cor || '#6b7280'
      };
    });

    return (
      <div className="pie-chart">
        <h3>🥧 Distribuição de Gastos</h3>
        <div className="pie-container">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartDataForRecharts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartDataForRecharts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="pie-legend">
          {sortedCategories.map(([categoria, valor]) => {
            const categoriaInfo = categorias[categoria];
            const percentage = (valor / total) * 100;
            
            return (
              <div key={categoria} className="legend-item">
                <div 
                  className="legend-color"
                  style={{ backgroundColor: categoriaInfo?.cor || '#6b7280' }}
                ></div>
                <span className="legend-label">{categoriaInfo?.nome || categoria}</span>
                <span className="legend-value">{formatCurrency(valor)}</span>
                <span className="legend-percentage">({percentage.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="charts-section">
      <div className="section-header">
        <h1>📊 Gráficos e Visualizações</h1>
        <p>Análise visual avançada dos seus dados financeiros</p>
      </div>

      {/* Controles */}
      <div className="chart-controls">
        <div className="control-group">
          <label>Período:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="3months">Últimos 3 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="12months">Últimos 12 meses</option>
          </select>
        </div>

        <div className="control-group">
          <label>Tipo de Gráfico:</label>
          <select 
            value={selectedChart} 
            onChange={(e) => setSelectedChart(e.target.value)}
            className="chart-select"
          >
            <option value="trends">Tendências (Barras)</option>
            <option value="line">Tendências (Linha)</option>
            <option value="categories">Categorias</option>
            <option value="heatmap">Heatmap Semanal</option>
            <option value="pie">Distribuição</option>
          </select>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-container">
        {selectedChart === 'trends' && renderTrendsChart()}
        {selectedChart === 'line' && renderLineChart()}
        {selectedChart === 'categories' && renderCategoriesChart()}
        {selectedChart === 'heatmap' && renderWeeklyHeatmap()}
        {selectedChart === 'pie' && renderPieChart()}
      </div>

      {/* Estatísticas Resumidas */}
      {statistics && (
        <div className="chart-statistics">
          <h3>📈 Estatísticas do Período</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Valor Máximo</h4>
                <p>{formatCurrency(statistics.maxValue)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📉</div>
              <div className="stat-content">
                <h4>Valor Mínimo</h4>
                <p>{formatCurrency(statistics.minValue)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h4>Média</h4>
                <p>{formatCurrency(statistics.avgValue)}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                {statistics.trend === 'up' ? '📈' : statistics.trend === 'down' ? '📉' : '➡️'}
              </div>
              <div className="stat-content">
                <h4>Tendência</h4>
                <p className={`trend-${statistics.trend}`}>
                  {statistics.trendPercentage > 0 ? '+' : ''}{statistics.trendPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartsSection;
