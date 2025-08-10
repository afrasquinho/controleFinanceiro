
import React, { useState } from 'react';
import { calculateGastosVariaveis, formatCurrency } from '../utils/calculations';

const GastosVariaveisSection = ({ mes, gastos, onAddGasto, onRemoveGasto }) => {
  const [formData, setFormData] = useState({
    data: `2025-${String(mes.numero).padStart(2, '0')}-01`,
    desc: '',
    valor: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.desc && formData.valor) {
      onAddGasto(mes.id, formData.data, formData.desc, formData.valor);
      setFormData({ ...formData, desc: '', valor: '' });
    } else {
      alert('Por favor, preencha todos os campos');
    }
  };

  const totalGastosVariaveis = calculateGastosVariaveis(gastos);

  return (
    <div className="section">
      <div className="section-header">🛒 GASTOS VARIÁVEIS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {gastos.length > 0 ? (
              gastos.map((gasto, index) => (
                <tr key={index}>
                  <td>{gasto.data}</td>
                  <td>{gasto.desc}</td>
                  <td className="valor">
                    {formatCurrency(gasto.valor)}
                    <button 
                      onClick={() => onRemoveGasto(mes.id, index)}
                      className="remove-btn"
                      title="Remover gasto"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  Nenhum gasto variável registrado
                </td>
              </tr>
            )}
            <tr className="total">
              <td colSpan="2"><strong>SUBTOTAL VARIÁVEIS</strong></td>
              <td className="valor">
                <strong>{formatCurrency(totalGastosVariaveis)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        
        <form onSubmit={handleSubmit} className="input-row">
          <input 
            type="date" 
            value={formData.data}
            onChange={(e) => setFormData({...formData, data: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="Descrição do gasto"
            value={formData.desc}
            onChange={(e) => setFormData({...formData, desc: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Valor" 
            step="0.01"
            min="0"
            value={formData.valor}
            onChange={(e) => setFormData({...formData, valor: e.target.value})}
            required
          />
          <button type="submit" className="btn">
            Adicionar Gasto
          </button>
        </form>
      </div>
    </div>
  );
};

export default GastosVariaveisSection;
