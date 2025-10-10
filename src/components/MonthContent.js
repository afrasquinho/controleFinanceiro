// src/components/MonthContent.js
import React from 'react';
import RendimentosSection from './RendimentosSection.js';
import DividasSection from './DividasSection.js';
import GastosFixosSection from './GastosFixosSection.js';
import GastosVariaveisSection from './GastosVariaveisSection.js';
import SummarySection from './SummarySection.js';

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
