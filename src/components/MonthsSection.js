import React from 'react';

const MonthsSection = ({ gastosData }) => {
  return (
    <div className="months-section">
      <h3>Meses Ativos</h3>
      <ul>
        {Object.keys(gastosData).map(mesId => (
          <li key={mesId}>{mesId.toUpperCase()}</li>
        ))}
      </ul>
    </div>
  );
};

export default MonthsSection;
