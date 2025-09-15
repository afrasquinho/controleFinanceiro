
import React, { useState } from 'react';
import { calculateGastosVariaveis, formatCurrency } from '../utils/calculations';

const GastosVariaveisSection = ({ mes, gastos, onAddGasto, onRemoveGasto }) => {
  const [formData, setFormData] = useState({
    data: `2025-${String(mes.numero).padStart(2, '0')}-01`,
    desc: '',
    valor: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const validateDescription = (desc) => {
    const sanitized = desc.trim();
    return sanitized.length >= 2 && sanitized.length <= 100;
  };

  const validateValue = (valor) => {
    const numValue = parseFloat(valor);
    return !isNaN(numValue) && numValue > 0 && numValue <= 1000000;
  };

  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const currentYear = new Date().getFullYear();
    return selectedDate.getFullYear() >= currentYear - 1 && selectedDate.getFullYear() <= currentYear + 1;
  };

  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormErrors({});

    const sanitizedDesc = sanitizeInput(formData.desc);
    const sanitizedValor = formData.valor;

    let errors = {};

    if (!validateDescription(sanitizedDesc)) {
      errors.desc = 'Descrição deve ter entre 2 e 100 caracteres.';
    }

    if (!validateValue(sanitizedValor)) {
      errors.valor = 'Valor deve ser um número positivo menor que R$ 1.000.000.';
    }

    if (!validateDate(formData.data)) {
      errors.data = 'Data deve estar dentro de um ano do ano atual.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onAddGasto(mes.id, formData.data, sanitizedDesc, sanitizedValor);
    setFormData({ ...formData, desc: '', valor: '' });
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
          <div className="form-group">
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
              required
            />
            {formErrors.data && <div className="error-message">{formErrors.data}</div>}
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Descrição do gasto"
              value={formData.desc}
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
              required
            />
            {formErrors.desc && <div className="error-message">{formErrors.desc}</div>}
          </div>
          <div className="form-group">
            <input
              type="number"
              placeholder="Valor"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              required
            />
            {formErrors.valor && <div className="error-message">{formErrors.valor}</div>}
          </div>
          <button type="submit" className="btn">
            Adicionar Gasto
          </button>
        </form>
      </div>
    </div>
  );
};

export default GastosVariaveisSection;
