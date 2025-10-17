import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MESES_NOMES, MESES_LIST } from '../config/constants.js';
import { valoresDefault, mesesInfo } from '../data/monthsData.js';
import { formatCurrency, calculateGastosVariaveis } from '../utils/calculations.js';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const MonthsSection = ({ gastosData }) => {
  const { gastosFixos, rendimentosData, diasTrabalhados } = useUnifiedFirestore();

  // Debug info available in development mode

  // Calculate comprehensive monthly statistics
  const monthlyStats = useMemo(() => {
    return MESES_LIST.map(mesId => {
      const gastos = gastosData[mesId] || [];
      const totalGastosVariaveis = calculateGastosVariaveis(gastos);

      // Add fixed expenses for this month
      let totalGastosFixos = 0;
      if (gastosFixos && gastosFixos[mesId]) {
        totalGastosFixos = Object.values(gastosFixos[mesId]).reduce((total, valor) => total + valor, 0);
      }

      // Add income data
      const rendimentosMes = rendimentosData[mesId] || [];
      const totalRendimentosExtras = Array.isArray(rendimentosMes)
        ? rendimentosMes.reduce((sum, r) => sum + (r.valor || 0), 0)
        : 0;

      // If no gastos and no rendimentos extras, and no diasTrabalhados for this month, consider base rendimentos as 0
      const hasGastos = gastos.length > 0;
      const hasRendimentosExtras = totalRendimentosExtras > 0;
      const hasDiasTrabalhados = diasTrabalhados && diasTrabalhados[mesId];
      const baseRendimentos = (hasGastos || hasRendimentosExtras || hasDiasTrabalhados)
        ? (() => {
            const mesInfo = mesesInfo.find(m => m.id === mesId);
            let dias = diasTrabalhados && diasTrabalhados[mesId] ? diasTrabalhados[mesId] : { andre: mesInfo.dias, aline: mesInfo.dias };
            // Parse dias.andre and dias.aline as numbers, fallback to mesInfo.dias if invalid
            const diasAndre = Number(dias.andre);
            const diasAline = Number(dias.aline);
            dias = {
              andre: isNaN(diasAndre) ? mesInfo.dias : diasAndre,
              aline: isNaN(diasAline) ? mesInfo.dias : diasAline
            };
            const rendimentoBaseAndre = valoresDefault.valorAndre * dias.andre;
            // Removed IVA from rendimentoBaseAndre
            const totalAndre = rendimentoBaseAndre;
            const rendimentoBaseAline = valoresDefault.valorAline * dias.aline;
            // Removed IVA from rendimentoBaseAline
            const totalAline = rendimentoBaseAline;
            console.log(`Month: ${mesId}, baseRendimentos: ${totalAndre + totalAline}, totalRendimentosExtras: ${totalRendimentosExtras}`);
            return totalAndre + totalAline;
          })()
        : 0;

      const totalRendimentos = baseRendimentos + totalRendimentosExtras;
      const totalGastos = totalGastosVariaveis + totalGastosFixos;
      const saldo = totalRendimentos - totalGastos;
      const numTransacoes = gastos.length;

      return {
        mes: MESES_NOMES[mesId] || mesId,
        mesId,
        totalGastos: Math.round(totalGastos * 100) / 100,
        totalGastosVariaveis: Math.round(totalGastosVariaveis * 100) / 100,
        totalGastosFixos: Math.round(totalGastosFixos * 100) / 100,
        totalRendimentos: Math.round(totalRendimentos * 100) / 100,
        saldo: Math.round(saldo * 100) / 100,
        numTransacoes,
        ativo: numTransacoes > 0 || totalGastosFixos > 0 || totalRendimentos > 0
      };
    }).filter(stat => stat.ativo);
  }, [gastosData, gastosFixos, rendimentosData, diasTrabalhados]);

  // Prepare data for bar chart
  const barChartData = useMemo(() => {
    return monthlyStats.map(stat => ({
      name: stat.mes.substring(0, 3),
      Rendimentos: stat.totalRendimentos,
      Gastos: stat.totalGastos,
      Saldo: stat.saldo
    }));
  }, [monthlyStats]);

  // Prepare data for pie chart (expense categories)
  const pieChartData = useMemo(() => {
    const categories = {};
    monthlyStats.forEach(stat => {
      if (stat.totalGastosVariaveis > 0) categories['Variáveis'] = (categories['Variáveis'] || 0) + stat.totalGastosVariaveis;
      if (stat.totalGastosFixos > 0) categories['Fixos'] = (categories['Fixos'] || 0) + stat.totalGastosFixos;
    });

    return Object.entries(categories).map(([name, value], index) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: COLORS[index % COLORS.length]
    }));
  }, [monthlyStats]);

  // Prepare data for line chart (balance trend)
  const lineChartData = useMemo(() => {
    return monthlyStats.map(stat => ({
      name: stat.mes.substring(0, 3),
      Saldo: stat.saldo
    }));
  }, [monthlyStats]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (monthlyStats.length === 0) return null;

    const totalRendimentos = monthlyStats.reduce((sum, stat) => sum + stat.totalRendimentos, 0);
    const totalGastos = monthlyStats.reduce((sum, stat) => sum + stat.totalGastos, 0);
    const totalSaldo = monthlyStats.reduce((sum, stat) => sum + stat.saldo, 0);
    const totalTransacoes = monthlyStats.reduce((sum, stat) => sum + stat.numTransacoes, 0);

    return {
      totalRendimentos: Math.round(totalRendimentos * 100) / 100,
      totalGastos: Math.round(totalGastos * 100) / 100,
      totalSaldo: Math.round(totalSaldo * 100) / 100,
      totalTransacoes,
      mediaMensal: Math.round((totalSaldo / monthlyStats.length) * 100) / 100,
      mesesAtivos: monthlyStats.length
    };
  }, [monthlyStats]);

  return (
    <div className="months-section" role="region" aria-label="Análise Mensal Detalhada">
      <h3>📊 Análise Mensal Detalhada</h3>

      {monthlyStats.length === 0 ? (
        <p>Nenhum dado mensal encontrado.</p>
      ) : (
        <div className="months-analysis">
          {/* Summary Statistics Cards */}
          {summaryStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Rendimentos</h4>
                <span className="stat-value positive">{formatCurrency(summaryStats.totalRendimentos)}</span>
              </div>
              <div className="stat-card">
                <h4>Total Gastos</h4>
                <span className="stat-value negative">{formatCurrency(summaryStats.totalGastos)}</span>
              </div>
              <div className="stat-card">
                <h4>Saldo Total</h4>
                <span className={`stat-value ${summaryStats.totalSaldo >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(summaryStats.totalSaldo)}
                </span>
              </div>
              <div className="stat-card">
                <h4>Transações</h4>
                <span className="stat-value">{summaryStats.totalTransacoes}</span>
              </div>
              <div className="stat-card">
                <h4>Meses Ativos</h4>
                <span className="stat-value">{summaryStats.mesesAtivos}</span>
              </div>
              <div className="stat-card">
                <h4>Média Mensal</h4>
                <span className={`stat-value ${summaryStats.mediaMensal >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(summaryStats.mediaMensal)}
                </span>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="charts-section">
            {/* Bar Chart - Income vs Expenses */}
            <div className="chart-container">
              <h4>Rendimentos vs Gastos por Mês</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="Rendimentos" fill="#00C49F" />
                  <Bar dataKey="Gastos" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Expense Categories */}
            <div className="chart-container">
              <h4>Distribuição de Gastos</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart - Balance Trend */}
            <div className="chart-container">
              <h4>Evolução do Saldo</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line
                    type="monotone"
                    dataKey="Saldo"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Monthly Table */}
          <div className="monthly-table">
            <h4>Detalhes por Mês</h4>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Rendimentos</th>
                    <th>Gastos Fixos</th>
                    <th>Gastos Variáveis</th>
                    <th>Total Gastos</th>
                    <th>Saldo</th>
                    <th>Transações</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyStats.map(stat => (
                    <tr key={stat.mesId}>
                      <td>{stat.mes}</td>
                      <td className="positive">{formatCurrency(stat.totalRendimentos)}</td>
                      <td className="negative">{formatCurrency(stat.totalGastosFixos)}</td>
                      <td className="negative">{formatCurrency(stat.totalGastosVariaveis)}</td>
                      <td className="negative">{formatCurrency(stat.totalGastos)}</td>
                      <td className={stat.saldo >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(stat.saldo)}
                      </td>
                      <td>{stat.numTransacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .months-analysis {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .stat-card h4 {
          margin: 0 0 0.5rem 0;
          color: #6c757d;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #495057;
        }

        .stat-value.positive {
          color: #28a745;
        }

        .stat-value.negative {
          color: #dc3545;
        }

        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .chart-container h4 {
          margin: 0 0 1rem 0;
          color: #495057;
          text-align: center;
          font-size: 1.1rem;
        }

        .monthly-table {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .monthly-table h4 {
          margin: 0 0 1rem 0;
          color: #495057;
          font-size: 1.1rem;
        }

        .table-responsive {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e9ecef;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          position: sticky;
          top: 0;
        }

        tr:hover {
          background: #f8f9fa;
        }

        .positive {
          color: #28a745;
          font-weight: 600;
        }

        .negative {
          color: #dc3545;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .charts-section {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-value {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MonthsSection;
