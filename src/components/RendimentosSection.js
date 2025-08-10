
import React from 'react';
import { calculateRendimentos, formatCurrency } from '../utils/calculations';
import { valoresDefault } from '../data/monthsData';

const RendimentosSection = ({ mes }) => {
  const rendimentos = calculateRendimentos(mes.id);

  return (
    <div className="section">
      <div className="section-header">📈 RENDIMENTOS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        <table>
          <thead>
            <tr>
              <th>Fonte</th>
              <th>Valor/Dia</th>
              <th>Dias</th>
              <th>IVA (23%)</th>
              <th>Total Bruto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Eu ({valoresDefault.valorEu}€ + IVA)</td>
              <td className="valor">{formatCurrency(valoresDefault.valorEu)}</td>
              <td className="valor">{mes.dias}</td>
              <td className="valor">{formatCurrency(rendimentos.eu.iva)}</td>
              <td className="valor">{formatCurrency(rendimentos.eu.total)}</td>
            </tr>
            <tr>
              <td>Esposa ({valoresDefault.valorEsposa}€ + IVA)</td>
              <td className="valor">{formatCurrency(valoresDefault.valorEsposa)}</td>
              <td className="valor">{mes.dias}</td>
              <td className="valor">{formatCurrency(rendimentos.esposa.iva)}</td>
              <td className="valor">{formatCurrency(rendimentos.esposa.total)}</td>
            </tr>
            <tr className="total">
              <td><strong>TOTAL RENDIMENTOS</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="valor"><strong>{formatCurrency(rendimentos.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RendimentosSection;
