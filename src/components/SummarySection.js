
import React from 'react';
import { calculateSaldo, formatCurrency } from '../utils/calculations';

const SummarySection = ({ mes, gastos }) => {
  const saldoInfo = calculateSaldo(mes.id, gastos);
  
  const getSaldoClass = (saldo) => {
    return saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo';
  };

  const getTaxaPoupanca = () => {
    return ((saldoInfo.saldo / saldoInfo.rendimentos) * 100).toFixed(1);
  };

  return (
    <div className="summary">
      <h3>📊 RESULTADO DO MÊS - {mes.nome.toUpperCase()}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
        <div>
          <p><strong>💰 Rendimentos:</strong> {formatCurrency(saldoInfo.rendimentos)}</p>
          <p><strong>🏠 Gastos Fixos:</strong> {formatCurrency(saldoInfo.gastosFixos)}</p>
          <p><strong>🛒 Gastos Variáveis:</strong> {formatCurrency(saldoInfo.gastosVariaveis)}</p>
        </div>
        <div>
          <p><strong>💸 Gastos Totais:</strong> {formatCurrency(saldoInfo.gastosTotal)}</p>
          <p><strong>📈 SALDO:</strong> 
            <span className={getSaldoClass(saldoInfo.saldo)} style={{ marginLeft: '10px' }}>
              {formatCurrency(saldoInfo.saldo)}
            </span>
          </p>
          <p><strong>🎯 Taxa de Poupança:</strong> {getTaxaPoupanca()}%</p>
        </div>
      </div>
      
      {/* Indicadores visuais */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px' }}>Gastos vs Rendimentos</span>
          <span style={{ fontSize: '12px' }}>
            {((saldoInfo.gastosTotal / saldoInfo.rendimentos) * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '10px', 
          backgroundColor: '#ecf0f1', 
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${Math.min((saldoInfo.gastosTotal / saldoInfo.rendimentos) * 100, 100)}%`, 
            height: '100%', 
            backgroundColor: saldoInfo.gastosTotal > saldoInfo.rendimentos ? '#e74c3c' : '#3498db',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
