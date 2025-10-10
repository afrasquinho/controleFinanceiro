// src/components/SummarySection.js
import React from 'react';
import { calculateSaldo, formatCurrency } from '../utils/calculations.js';

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
      
      {/* Cards em flexbox */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-value" style={{color: '#27ae60'}}>
            {formatCurrency(saldoInfo.rendimentos)}
          </div>
          <div className="summary-label">💰 Rendimentos</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{color: '#3498db'}}>
            {formatCurrency(saldoInfo.gastosFixos)}
          </div>
          <div className="summary-label">🏠 Gastos Fixos</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{color: '#f39c12'}}>
            {formatCurrency(saldoInfo.gastosVariaveis)}
          </div>
          <div className="summary-label">🛒 Gastos Variáveis</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{color: '#e74c3c'}}>
            {formatCurrency(saldoInfo.gastosTotal)}
          </div>
          <div className="summary-label">💸 Gastos Totais</div>
        </div>
        
        <div className="summary-card">
          <div className={`summary-value ${getSaldoClass(saldoInfo.saldo)}`}>
            {formatCurrency(saldoInfo.saldo)}
          </div>
          <div className="summary-label">📈 SALDO FINAL</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{color: '#9b59b6'}}>
            {getTaxaPoupanca()}%
          </div>
          <div className="summary-label">🎯 Taxa Poupança</div>
        </div>
      </div>
      
      {/* Barra de progresso */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '5px' 
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Gastos vs Rendimentos</span>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {((saldoInfo.gastosTotal / saldoInfo.rendimentos) * 100).toFixed(1)}%
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '12px', 
          backgroundColor: '#ecf0f1', 
          borderRadius: '6px',
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
