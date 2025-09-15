// src/components/RendimentosSection.js
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import { valoresDefault } from '../data/monthsData';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore';

const RendimentosSection = ({ mes }) => {
  // Hook do Firestore
  const { 
    diasTrabalhados: firestoreDiasTrabalhados, 
    rendimentosData: firestoreRendimentosData,
    updateDiasTrabalhados,
    addRendimentoExtra,
    removeRendimentoExtra
  } = useUnifiedFirestore();

  const [rendimentosExtras, setRendimentosExtras] = useState([]);
  const [andreDias, setAndreDias] = useState(mes.dias);
  const [alineDias, setAlineDias] = useState(mes.dias);
  const [novoRendimento, setNovoRendimento] = useState({
    fonte: '',
    valor: '',
    descricao: ''
  });
  const [editandoDias, setEditandoDias] = useState(false);
  const [adicionandoRendimento, setAdicionandoRendimento] = useState(false);

  // Função para mostrar notificações
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 1000;
      animation: fadeIn 0.3s ease-in;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), type === 'error' ? 5000 : 3000);
  };

  // Carregar dados do Firestore
  useEffect(() => {
    // Carregar dias trabalhados
    if (firestoreDiasTrabalhados && firestoreDiasTrabalhados[mes.id]) {
      const dias = firestoreDiasTrabalhados[mes.id];
      setAndreDias(dias.andre !== undefined ? dias.andre : mes.dias);
      setAlineDias(dias.aline !== undefined ? dias.aline : mes.dias);
    } else {
      // Reset to default if no data in Firestore
      setAndreDias(mes.dias);
      setAlineDias(mes.dias);
    }

    // Carregar rendimentos extras
    if (firestoreRendimentosData && firestoreRendimentosData[mes.id]) {
      setRendimentosExtras(firestoreRendimentosData[mes.id]);
    }
  }, [firestoreDiasTrabalhados, firestoreRendimentosData, mes.dias, mes.id]);

  // Salvar dias trabalhados no Firestore com validação
  const salvarDias = async () => {
    const andreNum = parseInt(andreDias);
    const alineNum = parseInt(alineDias);

    if (isNaN(andreNum) || andreNum < 0 || andreNum > 31) {
      showNotification('❌ Dias de André devem estar entre 0 e 31', 'error');
      return;
    }

    if (isNaN(alineNum) || alineNum < 0 || alineNum > 31) {
      showNotification('❌ Dias de Aline devem estar entre 0 e 31', 'error');
      return;
    }

    try {
      const dias = {
        andre: andreNum,
        aline: alineNum
      };
      await updateDiasTrabalhados(mes.id, dias);
      showNotification('✅ Dias trabalhados salvos com sucesso!', 'success');
      setEditandoDias(false);
    } catch (error) {
      showNotification('❌ Erro ao salvar dias trabalhados. Tente novamente.', 'error');
    }
  };

  // Adicionar novo rendimento no Firestore com validação
  const adicionarRendimento = async () => {
    // Sanitizar e validar fonte
    const fonteSanitized = novoRendimento.fonte.trim();
    if (!fonteSanitized || fonteSanitized.length < 2 || fonteSanitized.length > 50) {
      showNotification('❌ Fonte deve ter entre 2 e 50 caracteres', 'error');
      return;
    }

    // Validar valor
    const valorNum = parseFloat(novoRendimento.valor);
    if (!novoRendimento.valor || isNaN(valorNum) || valorNum <= 0 || valorNum > 1000000) {
      showNotification('❌ Valor deve ser um número positivo menor que 1.000.000', 'error');
      return;
    }

    // Sanitizar descrição (opcional)
    const descricaoSanitized = novoRendimento.descricao.trim();
    if (descricaoSanitized.length > 200) {
      showNotification('❌ Descrição deve ter no máximo 200 caracteres', 'error');
      return;
    }

    try {
      const rendimento = {
        fonte: fonteSanitized,
        valor: valorNum,
        descricao: descricaoSanitized
      };

      await addRendimentoExtra(mes.id, rendimento);

      // Limpar formulário
      setNovoRendimento({ fonte: '', valor: '', descricao: '' });
      setAdicionandoRendimento(false);
      showNotification('✅ Rendimento adicionado com sucesso!', 'success');
    } catch (error) {
      showNotification('❌ Erro ao adicionar rendimento. Tente novamente.', 'error');
    }
  };

  // Remover rendimento do Firestore
  const removerRendimento = async (rendimentoId) => {
    if (window.confirm('Tem certeza que deseja remover este rendimento?')) {
      try {
        await removeRendimentoExtra(mes.id, rendimentoId);
        showNotification('✅ Rendimento removido com sucesso!', 'success');
      } catch (error) {
        showNotification('❌ Erro ao remover rendimento. Tente novamente.', 'error');
      }
    }
  };

  // Cálculos
  const rendimentoBaseAndre = valoresDefault.valorAndre * andreDias;
  const ivaAndre = rendimentoBaseAndre * valoresDefault.iva;
  const totalAndre = rendimentoBaseAndre + ivaAndre;

  const rendimentoBaseAline = valoresDefault.valorAline * alineDias;
  const ivaAline = rendimentoBaseAline * valoresDefault.iva;
  const totalAline = rendimentoBaseAline + ivaAline;

  const totalRendimentosExtras = rendimentosExtras.reduce((total, r) => total + r.valor, 0);
  const totalGeral = totalAndre + totalAline + totalRendimentosExtras;

  return (
    <div className="section">
      <div className="section-header">📈 RENDIMENTOS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        
        <div className="table-container">
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
                <td>💼 André</td>
                <td className="valor">{formatCurrency(valoresDefault.valorAndre)}</td>
                <td className="valor">
                  <input
                    type="number"
                    value={andreDias}
                    onChange={(e) => setAndreDias(e.target.value)}
                    style={{ 
                      width: '60px', 
                      textAlign: 'center',
                      padding: '5px',
                      border: '1px solid #3498db',
                      borderRadius: '3px'
                    }}
                    min="0"
                    max="31"
                    disabled={!editandoDias} // Desabilitar se não estiver editando
                  />
                </td>
                <td className="valor">{formatCurrency(ivaAndre)}</td>
                <td className="valor">{formatCurrency(totalAndre)}</td>
                <td>
                  <button 
                    onClick={() => setEditandoDias(!editandoDias)} 
                    className="btn" 
                    style={{background: editandoDias ? '#e74c3c' : '#3498db', padding: '5px 10px', fontSize: '12px'}}
                    title={editandoDias ? "Cancelar edição" : "Editar dias"}
                  >
                    {editandoDias ? '❌' : '✏️'}
                  </button>
                  {editandoDias && (
                    <button 
                      onClick={salvarDias} 
                      className="btn" 
                      style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                      title="Salvar dias"
                    >
                      💾
                    </button>
                  )}
                </td>
              </tr>
              <tr>
                <td>👩‍💼 Aline</td>
                <td className="valor">{formatCurrency(valoresDefault.valorAline)}</td>
                <td className="valor">
                  <input
                    type="number"
                    value={alineDias}
                    onChange={(e) => setAlineDias(e.target.value)}
                    style={{ 
                      width: '60px', 
                      textAlign: 'center',
                      padding: '5px',
                      border: '1px solid #3498db',
                      borderRadius: '3px'
                    }}
                    min="0"
                    max="31"
                    disabled={!editandoDias} // Desabilitar se não estiver editando
                  />
                </td>
                <td className="valor">{formatCurrency(ivaAline)}</td>
                <td className="valor">{formatCurrency(totalAline)}</td>
                <td>
                  <button 
                    onClick={() => setEditandoDias(!editandoDias)} 
                    className="btn" 
                    style={{background: editandoDias ? '#e74c3c' : '#3498db', padding: '5px 10px', fontSize: '12px'}}
                    title={editandoDias ? "Cancelar edição" : "Editar dias"}
                  >
                    {editandoDias ? '❌' : '✏️'}
                  </button>
                  {editandoDias && (
                    <button 
                      onClick={salvarDias} 
                      className="btn" 
                      style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                      title="Salvar dias"
                    >
                      💾
                    </button>
                  )}
                </td>
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

              {/* Botão para adicionar rendimentos extras */}
              <tr style={{backgroundColor: '#e8f4fd'}}>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setAdicionandoRendimento(!adicionandoRendimento)}
                    className="btn"
                    style={{background: '#3498db', padding: '5px 10px', fontSize: '12px'}}
                    title="Adicionar rendimentos extras"
                  >
                    {adicionandoRendimento ? '❌ Cancelar' : '➕ Adicionar Rendimentos Extras'}
                  </button>
                </td>
              </tr>

              {/* Formulário para adicionar novo rendimento */}
              {adicionandoRendimento && (
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
                    <button
                      onClick={adicionarRendimento}
                      className="btn"
                      style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                      title="Adicionar rendimento"
                    >
                      ➕
                    </button>
                  </td>
                </tr>
              )}

              <tr className="total">
                <td><strong>SUBTOTAL TRABALHO</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="valor"><strong>{formatCurrency(totalAndre + totalAline)}</strong></td>
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
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informações */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <p><strong>💡 Como usar:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li><strong>Valores fixos:</strong> André: {formatCurrency(valoresDefault.valorAndre)}/dia • Aline: {formatCurrency(valoresDefault.valorAline)}/dia</li>
            <li><strong>Editar dias:</strong> Clique em ✏️ para editar os dias trabalhados</li>
            <li><strong>Salvar:</strong> Clique em 💾 para salvar os dias trabalhados</li>
            <li><strong>Rendimentos extras:</strong> Clique em ➕ para adicionar freelances, bônus, etc.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RendimentosSection;
