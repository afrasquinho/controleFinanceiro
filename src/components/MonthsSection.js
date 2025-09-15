import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MESES_NOMES, MESES_LIST } from '../config/constants';

const MonthsSection = ({ gastosData }) => {
  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    return MESES_LIST.map(mesId => {
      const gastos = gastosData[mesId] || [];
      const totalGastos = gastos.reduce((sum, gasto) => sum + (parseFloat(gasto.valor) || 0), 0);
      const numTransacoes = gastos.length;

      return {
        mes: MESES_NOMES[mesId] || mesId,
        mesId,
        totalGastos: Math.round(totalGastos * 100) / 100, // Round to 2 decimal places
        numTransacoes,
        ativo: numTransacoes > 0
      };
    }).filter(stat => stat.ativo); // Only show months with data
  }, [gastosData]);

  // Filter months that have data
  const activeMonths = MESES_LIST.filter(mesId => gastosData[mesId] && gastosData[mesId].length > 0);

  return (
    <div className="months-section" role="region" aria-label="Meses Ativos">
      <h3>Meses Ativos</h3>

      {activeMonths.length === 0 ? (
        <p>Nenhum mês ativo encontrado.</p>
      ) : (
        <>
          {/* Chart Visualization */}
          <div className="chart-container" style={{ width: '100%', height: '300px', marginBottom: '20px' }}>
            <ResponsiveContainer>
              <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'totalGastos' ? `R$ ${value.toFixed(2)}` : value,
                    name === 'totalGastos' ? 'Total de Gastos' : 'Transações'
                  ]}
                  labelStyle={{ color: '#000' }}
                />
                <Bar
                  dataKey="totalGastos"
                  fill="#8884d8"
                  name="totalGastos"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Statistics */}
          <div className="months-summary" style={{ marginBottom: '20px' }}>
            <h4>Resumo por Mês</h4>
            <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {monthlyStats.map(stat => (
                <div key={stat.mesId} className="month-card" style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>{stat.mes}</h5>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    <div>Gastos: <strong>R$ {stat.totalGastos.toFixed(2)}</strong></div>
                    <div>Transações: <strong>{stat.numTransacoes}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* List View (for accessibility and fallback) */}
          <details>
            <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
              Ver Lista de Meses
            </summary>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {activeMonths.map(mesId => (
                <li key={mesId} tabIndex={0} style={{
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer'
                }}>
                  {MESES_NOMES[mesId] || mesId}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
};

export default MonthsSection;
