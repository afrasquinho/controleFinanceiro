// src/components/SummarySection.js
import React, { useMemo } from 'react';
import { formatCurrency } from '../utils/calculations.js';
import { valoresDefault, mesesInfo } from '../data/monthsData.js';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';

const SummarySection = ({ mes, gastos }) => {
  const {
    gastosFixos: firestoreGastosFixos,
    diasTrabalhados: firestoreDiasTrabalhados,
    rendimentosData: firestoreRendimentosData
  } = useUnifiedFirestore();

  const getMesAnterior = (mesAtualId) => {
    const mesAtualIndex = mesesInfo.findIndex(m => m.id === mesAtualId);
    if (mesAtualIndex === -1 || mesAtualIndex === 0) {
      return mesesInfo[mesesInfo.length - 1];
    }
    return mesesInfo[mesAtualIndex - 1];
  };

  const mesAnterior = getMesAnterior(mes.id);

  const saldoInfo = useMemo(() => {
    // Gastos fixos do mês atual
    const gastosFixosMes = firestoreGastosFixos[mes.id] || {};
    const totalGastosFixos = Object.values(gastosFixosMes).reduce((total, valor) => total + valor, 0);

    // Dias trabalhados do mês anterior (para calcular rendimentos líquidos do mês atual)
    const diasDoMesAnterior = firestoreDiasTrabalhados[mesAnterior.id] || {};
    const andreDias = diasDoMesAnterior.andre !== undefined ? diasDoMesAnterior.andre : mesAnterior.dias;
    const alineDias = diasDoMesAnterior.aline !== undefined ? diasDoMesAnterior.aline : mesAnterior.dias;

    const rendimentoBaseAndre = valoresDefault.valorAndre * andreDias;
    const ivaAndre = rendimentoBaseAndre * valoresDefault.iva;
    const totalAndreLiquido = rendimentoBaseAndre - ivaAndre;

    const rendimentoBaseAline = valoresDefault.valorAline * alineDias;
    const ivaAline = rendimentoBaseAline * valoresDefault.iva;
    const totalAlineLiquido = rendimentoBaseAline - ivaAline;

    const ivaTotal = ivaAndre + ivaAline;

    // Rendimentos extras do mês atual
    const rendimentosExtrasMes = firestoreRendimentosData[mes.id] || [];
    const totalRendimentosExtras = rendimentosExtrasMes.reduce((total, r) => total + (r.valor || 0), 0);

    const rendimentosTotal = totalAndreLiquido + totalAlineLiquido + totalRendimentosExtras;

    // Gastos variáveis do mês atual (dados recebidos do componente pai)
    const gastosVariaveis = (Array.isArray(gastos) ? gastos : []).reduce((total, gasto) => total + (gasto.valor || 0), 0);

    // Gastos totais incluem fixos, variáveis e IVA retido (tratado como despesa)
    const gastosTotal = totalGastosFixos + gastosVariaveis + ivaTotal;

    const saldo = rendimentosTotal - gastosTotal;

    return {
      rendimentos: rendimentosTotal,
      gastosFixos: totalGastosFixos,
      gastosVariaveis,
      gastosTotal,
      saldo
    };
  }, [
    gastos,
    firestoreGastosFixos,
    firestoreDiasTrabalhados,
    firestoreRendimentosData,
    mes.id,
    mesAnterior.id,
    mesAnterior.dias
  ]);

  const getSaldoClass = (saldo) => (saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo');

  const getTaxaPoupanca = () => {
    if (!saldoInfo.rendimentos) return '0.0';
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
            {saldoInfo.rendimentos > 0
              ? ((saldoInfo.gastosTotal / saldoInfo.rendimentos) * 100).toFixed(1)
              : '0.0'}%
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
            width: `${saldoInfo.rendimentos > 0
              ? Math.min((saldoInfo.gastosTotal / saldoInfo.rendimentos) * 100, 100)
              : 0}%`,
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
