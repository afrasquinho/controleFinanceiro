// src/components/SummarySection.js
import React, { useMemo } from 'react';
import { formatCurrency } from '../utils/calculations.js';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';
import { mesesInfo, valoresDefault } from '../data/monthsData.js';

const SummarySection = ({ mes, gastos }) => {
  const { gastosFixos, rendimentosData, diasTrabalhados } = useUnifiedFirestore();

  const getMesAnterior = (mesAtualId) => {
    const idx = mesesInfo.findIndex(m => m.id === mesAtualId);
    if (idx === -1) return mesesInfo[0];
    return idx === 0 ? mesesInfo[mesesInfo.length - 1] : mesesInfo[idx - 1];
  };

  const mesAnterior = getMesAnterior(mes.id);

  const saldoInfo = useMemo(() => {
    // Gastos variáveis do mês (já recebidos)
    const gastosVariaveis = Array.isArray(gastos) ? gastos.reduce((s, g) => s + (g.valor || 0), 0) : 0;

    // Gastos fixos do mês via Firestore
    const fixosMes = gastosFixos[mes.id] || {};
    const gastosFixosTotal = Object.values(fixosMes).reduce((s, v) => s + (v || 0), 0);

    // Rendimentos: base (mês anterior) + extras (mês atual)
    const dias = diasTrabalhados[mesAnterior.id] || { andre: mesAnterior.dias, aline: mesAnterior.dias };
    const baseAndre = valoresDefault.valorAndre * (dias.andre ?? mesAnterior.dias);
    const baseAline = valoresDefault.valorAline * (dias.aline ?? mesAnterior.dias);
    const ivaAndre = baseAndre * valoresDefault.iva;
    const ivaAline = baseAline * valoresDefault.iva;
    const afterTaxAndre = baseAndre - ivaAndre;
    const afterTaxAline = baseAline - ivaAline;
    const extrasMes = (rendimentosData[mes.id] || []).reduce((s, r) => s + (r.valor || 0), 0);
    const rendimentos = afterTaxAndre + afterTaxAline + extrasMes;

    // IVA conta como despesa do mês
    const ivaTotal = ivaAndre + ivaAline;
    const gastosTotal = gastosVariaveis + gastosFixosTotal + ivaTotal;
    const saldo = rendimentos - gastosTotal;

    return {
      rendimentos,
      gastosFixos: gastosFixosTotal,
      gastosVariaveis,
      gastosTotal,
      ivaTotal,
      saldo
    };
  }, [gastos, gastosFixos, rendimentosData, diasTrabalhados, mes.id, mesAnterior.id, mesAnterior.dias]);
  
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
          <div className="summary-subtext" style={{ fontSize: '12px', opacity: 0.75 }}>
            + IVA: {formatCurrency(saldoInfo.ivaTotal)}
          </div>
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
