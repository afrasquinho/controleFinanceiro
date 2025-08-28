// src/components/DividasSection.js
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/calculations';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore';

const DividasSection = ({ mes }) => {
  // Hook do Firestore

  useUnifiedFirestore();

  const [dividas, setDividas] = useState([]);
  const [editando, setEditando] = useState(false);
  const [novaDivida, setNovaDivida] = useState({
    credor: '',
    valor: '',
    descricao: '',
    dataVencimento: '',
    status: 'pendente'
  });

  // Carregar dívidas salvas
  useEffect(() => {
    const dividasSalvas = localStorage.getItem(`dividas_${mes.id}`);
    if (dividasSalvas) {
      setDividas(JSON.parse(dividasSalvas));
    }
  }, [mes.id]);

  // Salvar dívidas
  const salvarDividas = (novasDividas) => {
    localStorage.setItem(`dividas_${mes.id}`, JSON.stringify(novasDividas));
    setDividas(novasDividas);
  };

  // Adicionar nova dívida
  const adicionarDivida = () => {
    if (novaDivida.credor && novaDivida.valor) {
      const divida = {
        id: Date.now(),
        credor: novaDivida.credor,
        valor: parseFloat(novaDivida.valor),
        descricao: novaDivida.descricao,
        dataVencimento: novaDivida.dataVencimento,
        status: novaDivida.status,
        timestamp: new Date().toISOString()
      };

      const novasDividas = [...dividas, divida];
      salvarDividas(novasDividas);
      
      // Limpar formulário
      setNovaDivida({
        credor: '',
        valor: '',
        descricao: '',
        dataVencimento: '',
        status: 'pendente'
      });
      setEditando(false);
    } else {
      alert('Por favor, preencha pelo menos o credor e o valor');
    }
  };

  // Remover dívida
  const removerDivida = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta dívida?')) {
      const novasDividas = dividas.filter(d => d.id !== id);
      salvarDividas(novasDividas);
    }
  };

  // Alterar status da dívida
  const alterarStatus = (id, novoStatus) => {
    const novasDividas = dividas.map(divida => 
      divida.id === id ? { ...divida, status: novoStatus } : divida
    );
    salvarDividas(novasDividas);
  };

  const totalDividas = dividas.reduce((total, d) => total + d.valor, 0);
  const dividasPendentes = dividas.filter(d => d.status === 'pendente');
  const totalPendente = dividasPendentes.reduce((total, d) => total + d.valor, 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pendente': return '#e74c3c';
      case 'paga': return '#27ae60';
      case 'atrasada': return '#e67e22';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="section">
      <div className="section-header">💳 DÍVIDAS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        
        {/* Resumo das dívidas */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-value" style={{color: '#e74c3c'}}>
              {formatCurrency(totalDividas)}
            </div>
            <div className="summary-label">Total de Dívidas</div>
          </div>
          <div className="summary-card">
            <div className="summary-value" style={{color: '#e67e22'}}>
              {formatCurrency(totalPendente)}
            </div>
            <div className="summary-label">Pendentes</div>
          </div>
          <div className="summary-card">
            <div className="summary-value" style={{color: '#3498db'}}>
              {dividas.length}
            </div>
            <div className="summary-label">Total de Itens</div>
          </div>
        </div>

        {/* TABELA RESPONSIVA */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Credor</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {dividas.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '20px'}}>
                    Nenhuma dívida registrada para {mes.nome}
                  </td>
                </tr>
              ) : (
                dividas.map(divida => (
                  <tr key={divida.id} style={{
                    backgroundColor: divida.status === 'paga' ? '#f0f9f0' : 
                                     divida.status === 'atrasada' ? '#fff3e0' : 'transparent'
                  }}>
                    <td>
                      <strong>{divida.credor}</strong>
                    </td>
                    <td className="valor">
                      {formatCurrency(divida.valor)}
                    </td>
                    <td>
                      {divida.dataVencimento ? 
                        new Date(divida.dataVencimento).toLocaleDateString('pt-PT') : 
                        '-'
                      }
                    </td>
                    <td>
                      <select
                        value={divida.status}
                        onChange={(e) => alterarStatus(divida.id, e.target.value)}
                        style={{
                          padding: '5px',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          backgroundColor: getStatusColor(divida.status),
                          color: 'white',
                          fontSize: '12px'
                        }}
                      >
                        <option value="pendente">⏳ Pendente</option>
                        <option value="paga">✅ Paga</option>
                        <option value="atrasada">⚠️ Atrasada</option>
                      </select>
                    </td>
                    <td>
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {divida.descricao || '-'}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => removerDivida(divida.id)}
                        className="remove-btn"
                        title="Remover dívida"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* Formulário para adicionar nova dívida */}
              {editando && (
                <tr style={{backgroundColor: '#e8f4fd'}}>
                  <td>
                    <input
                      type="text"
                      placeholder="Ex: Banco, Cartão, Loja..."
                      value={novaDivida.credor}
                      onChange={(e) => setNovaDivida({...novaDivida, credor: e.target.value})}
                      style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px'}}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="Valor"
                      value={novaDivida.valor}
                      onChange={(e) => setNovaDivida({...novaDivida, valor: e.target.value})}
                      style={{width: '100px', padding: '5px', border: '1px solid #ddd', borderRadius: '3px', textAlign: 'right'}}
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={novaDivida.dataVencimento}
                      onChange={(e) => setNovaDivida({...novaDivida, dataVencimento: e.target.value})}
                      style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px'}}
                    />
                  </td>
                  <td>
                    <select
                      value={novaDivida.status}
                      onChange={(e) => setNovaDivida({...novaDivida, status: e.target.value})}
                      style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px'}}
                    >
                      <option value="pendente">⏳ Pendente</option>
                      <option value="paga">✅ Paga</option>
                      <option value="atrasada">⚠️ Atrasada</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Descrição (opcional)"
                      value={novaDivida.descricao}
                      onChange={(e) => setNovaDivida({...novaDivida, descricao: e.target.value})}
                      style={{width: '100%', padding: '5px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '12px'}}
                    />
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '5px'}}>
                      <button
                        onClick={adicionarDivida}
                        className="btn"
                        style={{background: '#27ae60', padding: '5px 10px', fontSize: '12px'}}
                        title="Salvar"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => {
                          setEditando(false);
                          setNovaDivida({
                            credor: '',
                            valor: '',
                            descricao: '',
                            dataVencimento: '',
                            status: 'pendente'
                          });
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
                <td><strong>TOTAL DÍVIDAS</strong></td>
                <td className="valor"><strong>{formatCurrency(totalDividas)}</strong></td>
                <td></td>
                <td>
                  <span style={{fontSize: '12px', color: '#666'}}>
                    {dividasPendentes.length} pendente(s)
                  </span>
                </td>
                <td></td>
                <td>
                  {!editando && (
                    <button
                      onClick={() => setEditando(true)}
                      className="btn"
                      style={{background: '#e74c3c', padding: '5px 10px', fontSize: '12px'}}
                      title="Adicionar dívida"
                    >
                      ➕
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dicas de uso */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666'
        }}>
          <p><strong>💡 Gestão de Dívidas:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Clique em ➕ para adicionar uma nova dívida</li>
            <li>Use o dropdown de status para marcar como paga/pendente/atrasada</li>
            <li>As dívidas são organizadas por mês</li>
            <li>Defina datas de vencimento para melhor controle</li>
            <li>Use 🗑️ para remover uma dívida</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DividasSection;
