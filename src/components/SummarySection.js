// src/components/SummarySection.js
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
      
      {/* Grid responsivo */}
      <div className="summary-grid">
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

      {/* Análise adicional */}
      <div style={{ 
        marginTop: '15px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <p><strong>📈 Análise do Mês:</strong></p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>
            <strong>Situação:</strong> {saldoInfo.saldo >= 0 ? 
              '✅ Mês positivo - conseguiu poupar!' : 
              '⚠️ Mês negativo - gastos superiores aos rendimentos'
            }
          </li>
          <li>
            <strong>Gastos Fixos:</strong> {((saldoInfo.gastosFixos / saldoInfo.rendimentos) * 100).toFixed(1)}% dos rendimentos
          </li>
          <li>
            <strong>Gastos Variáveis:</strong> {((saldoInfo.gastosVariaveis / saldoInfo.rendimentos) * 100).toFixed(1)}% dos rendimentos
          </li>
          {saldoInfo.saldo > 0 && (
            <li>
              <strong>Poupança:</strong> Conseguiu poupar {getTaxaPoupanca()}% dos rendimentos
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SummarySection;
