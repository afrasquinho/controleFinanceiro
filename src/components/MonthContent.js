// src/components/MonthContent.js
import React from 'react';
import RendimentosSection from './RendimentosSection';
import DividasSection from './DividasSection';
import GastosFixosSection from './GastosFixosSection';
import GastosVariaveisSection from './GastosVariaveisSection';
import SummarySection from './SummarySection';

const MonthContent = ({ 
  mes, 
  isActive, 
  gastos, 
  onAddGasto, 
  onRemoveGasto 
}) => {
  if (!isActive) return null;

  return (
    <div className="month-content active">
      <RendimentosSection mes={mes} />
      <DividasSection mes={mes} />
      <GastosFixosSection mes={mes} />
      <GastosVariaveisSection 
        mes={mes}
        gastos={gastos}
        onAddGasto={onAddGasto}
        onRemoveGasto={onRemoveGasto}
      />
      <SummarySection mes={mes} gastos={gastos} />
    </div>
  );
};

export default MonthContent;
