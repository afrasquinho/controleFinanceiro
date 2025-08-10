
import React from 'react';
import { gastosFixosDefault } from '../data/monthsData';
import { calculateGastosFixos, formatCurrency } from '../utils/calculations';

const GastosFixosSection = ({ mes }) => {
  const totalGastosFixos = calculateGastosFixos();

  return (
    <div className="section">
      <div className="section-header">🏠 GASTOS FIXOS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Água</td>
              <td className="valor">{formatCurrency(gastosFixosDefault.agua)}</td>
            </tr>
            <tr>
              <td>Luz</td>
              <td className="valor">{formatCurrency(gastosFixosDefault.luz)}</td>
            </tr>
            <tr>
              <td>Internet</td>
              <td className="valor">{formatCurrency(gastosFixosDefault.internet)}</td>
            </tr>
            <tr>
              <td>Renda</td>
              <td className="valor">{formatCurrency(gastosFixosDefault.renda)}</td>
            </tr>
            <tr className="total">
              <td><strong>SUBTOTAL FIXOS</strong></td>
              <td className="valor"><strong>{formatCurrency(totalGastosFixos)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GastosFixosSection;
