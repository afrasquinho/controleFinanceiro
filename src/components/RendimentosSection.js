// src/components/RendimentosSection.js
import React, { useState, useEffect } from 'react';
import { calculateRendimentos, formatCurrency } from '../utils/calculations';
import { valoresDefault } from '../data/monthsData';

const RendimentosSection = ({ mes }) => {
  const [rendimentosExtras, setRendimentosExtras] = useState([]);
  const [editando, setEditando] = useState(false);
  const [novoRendimento, setNovoRendimento] = useState({
    fonte: '',
    valor: '',
    descricao: ''
  });

  // Carregar rendimentos extras salvos
  useEffect(() => {
    const rendimentosSalvos = localStorage.getItem(`rendimentosExtras_${mes.id}`);
    if (rendimentosSalvos) {
      setRendimentosExtras(JSON.parse(rendimentosSalvos));
    }
  }, [mes.id]);

  // Salvar rendimentos extras
  const salvarRendimentos = (novosRendimentos) => {
    localStorage.setItem(`rendimentosExtras_${mes.id}`, JSON.stringify(novosRendimentos));
    setRendimentosExtras(novosRendimentos);
  };

  // Adicionar novo rendimento
  const adicionarRendimento = () => {
    if (novoRendimento.fonte && novoRendimento.valor) {
      const rendimento = {
        id: Date.now(),
        fonte: novoRendimento.fonte,
        valor: parseFloat(novoRendimento.valor),
        descricao: novoRendimento.descricao,
        timestamp: new Date().toISOString()
      };

      const novosRendimentos = [...rendimentosExtras, rendimento];
      salvarRendimentos(novosRendimentos);
      
      // Limpar formulário
      setNovoRendimento({ fonte: '', valor: '', descricao: '' });
      setEditando(false);
    } else {
      alert('Por favor, preencha pelo menos a fonte e o valor');
    }
  };

  // Remover rendimento
  const removerRendimento = (id) => {
    if (window.confirm('Tem certeza que deseja remover este rendimento?')) {
      const novosRendimentos = rendimentosExtras.filter(r => r.id !== id);
      salvarRendimentos(novosRendimentos);
    }
  };

  const rendimentos = calculateRendimentos(mes.id);
  const totalRendimentosExtras = rendimentosExtras.reduce((total, r) => total + r.valor, 0);
  const totalGeral = rendimentos.total + totalRendimentosExtras;

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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>💼 André ({valoresDefault.valorAndre}€ + IVA)</td>
              <td className="valor">{formatCurrency(valoresDefault.valorAndre)}</td>
              <td className="valor">{mes.dias}</td>
              <td className="valor">{formatCurrency(rendimentos.andre.iva)}</td>
              <td className="valor">{formatCurrency(rendimentos.andre.total)}</td>
              <td><span style={{color: '#27ae60'}}>✓ Fixo</span></td>
            </tr>
            <tr>
              <td>👩‍💼 Aline ({valoresDefault.valorAline}€ + IVA)</td>
              <td className="valor">{formatCurrency(valoresDefault.valorAline)}</td>
              <td className="valor">{mes.dias}</td>
              <td className="valor">{formatCurrency(rendimentos.aline.iva)}</td>
              <td className="valor">{formatCurrency(rendimentos.aline.total)}</td>
              <td><span style={{color: '#27ae60'}}>✓ Fixo</span></td>
            </tr>
            
            {/* Rendimentos extras */}
            {rendimentosExtras.map(rendimento => (
              <tr key={rendimento.id} style={{backgroundColor: '#f8f9fa'}}>
                <td>
                  💰 {rendimento.fonte}
                  {rendimento.descricao && (
                    <div style={{fontSize: '12px', color: '#666', fontStyle: 'italic'}}>
                      {rendimento.descricao}
                    </div>
                  )}
                </td>
                <td className="valor">-</td>
                <td className="valor">-</td>
                <td className="valor">-</td>
                <td className="valor">{formatCurrency(rendimento.valor)}</td>
                <td>
                  <button
                    onClick={() => removerRendimento(rendimento.id)}
                    className="remove-btn"
                    title="Remover rendimento"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}

            {/* Formulário para adicionar novo rendimento */}
            {editando && (
              <tr style={{backgroundColor: '#e8f4fd'}}>
                <td>
                  <input
                    type="text"
                    placeholder="Ex: Freelance, Bonus, etc."
                    value={novoRendimento.fonte}
                    onChange={(e) => setNovoRendimento({...novoRendimento, fonte: e.target.value})}
                    style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px'}}
                  />
                  <input
                    type="text"
                    placeholder="Descrição (opcional)"
                    value={novoRendimento.descricao}
                    onChange={(e) => setNovoRendimento({...novoRendimento, descricao: e.target.value})}
                    style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px', marginTop: '5px', fontSize: '12px'}}
                  />
                </td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>
                  <input
                    type="number"
                    placeholder="Valor"
                    value={novoRendimento.valor}
                    onChange={(e) => setNovoRendimento({...novoRendimento, valor: e.target.value})}
                    style={{width: '100px', padding: '5px', border: '1px solid #ddd', borderRadius: '3px', textAlign: 'right'}}
                    step="0.01"
                  />
                </td>
                <td>
                  <div style={{display: 'flex', gap: '5px'}}>
                    <button
                      onClick={adicionarRendimento}
                      className="btn"
                      style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                      title="Salvar"
                    >
                      ✅
                    </button>
                    <button
                      onClick={() => {
                        setEditando(false);
                        setNovoRendimento({fonte: '', valor: '', descricao: ''});
                      }}
                      className="btn"
                      style={{background: '#e74c3c', padding: '5px 10px', fontSize: '12px'}}
                      title="Cancelar"
                    >
                      ❌
                    </button>
                  </div>
                </td>
              </tr>
            )}

            <tr className="total">
              <td><strong>SUBTOTAL TRABALHO</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="valor"><strong>{formatCurrency(rendimentos.total - (rendimentos.extras || 0))}</strong></td>
              <td></td>
            </tr>
            
            {totalRendimentosExtras > 0 && (
              <tr className="total" style={{backgroundColor: '#d5f4e6'}}>
                <td><strong>SUBTOTAL EXTRAS</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="valor"><strong>{formatCurrency(totalRendimentosExtras)}</strong></td>
                <td></td>
              </tr>
            )}

            <tr className="total" style={{backgroundColor: '#3498db', color: 'white'}}>
              <td><strong>TOTAL RENDIMENTOS</strong></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="valor"><strong>{formatCurrency(totalGeral)}</strong></td>
              <td>
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="btn"
                    style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                    title="Adicionar rendimento"
                  >
                    ➕
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Dicas de uso */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <p><strong>💡 Rendimentos extras:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Clique em ➕ para adicionar rendimentos extras (freelances, bônus, etc.)</li>
            <li>Os rendimentos extras são salvos por mês</li>
            <li>Use 🗑️ para remover um rendimento extra</li>
            <li>Os valores são incluídos automaticamente nos cálculos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RendimentosSection;
    