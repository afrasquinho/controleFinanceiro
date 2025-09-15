import React from 'react';
import { MESES_NOMES, MESES_LIST } from '../config/constants';

const MonthsSection = ({ gastosData }) => {
  // Filter months that have data
  const activeMonths = MESES_LIST.filter(mesId => gastosData[mesId] && gastosData[mesId].length > 0);

  return (
    <div className="months-section" role="region" aria-label="Meses Ativos">
      <h3>Meses Ativos</h3>
      {activeMonths.length === 0 ? (
        <p>Nenhum mês ativo encontrado.</p>
      ) : (
        <ul>
          {activeMonths.map(mesId => (
            <li key={mesId} tabIndex={0}>
              {MESES_NOMES[mesId] || mesId}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MonthsSection;
