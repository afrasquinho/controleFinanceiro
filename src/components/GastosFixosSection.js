// src/components/GastosFixosSection.js
import React, { useState, useEffect } from 'react';
import { gastosFixosDefault } from '../data/monthsData';
import { formatCurrency } from '../utils/calculations';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore';

const GastosFixosSection = ({ mes }) => {
  // Hook do Firestore
  const { gastosFixos: firestoreGastosFixos, updateGastosFixos } = useUnifiedFirestore();
  
  // Estado para gastos fixos editáveis
  const [gastosFixos, setGastosFixos] = useState(gastosFixosDefault);
  
  // Estado para controlar qual campo está sendo editado
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar gastos do Firestore ao inicializar
  useEffect(() => {
    if (firestoreGastosFixos && Object.keys(firestoreGastosFixos).length > 0) {
      setGastosFixos(firestoreGastosFixos);
    }
    setLoading(false);
  }, [firestoreGastosFixos]);

  // Função para editar um gasto
  const editarGasto = (categoria, novoValor) => {
    setGastosFixos(prev => ({
      ...prev,
      [categoria]: parseFloat(novoValor) || 0
    }));
  };

  // Função para salvar no Firestore
  const salvarGastos = async () => {
    try {
      await updateGastosFixos(gastosFixos);
      setEditando(null);
      console.log('✅ Gastos fixos salvos no Firestore:', gastosFixos);
    } catch (error) {
      console.error('❌ Erro ao salvar gastos fixos:', error);
      alert('Erro ao salvar gastos fixos. Verifique o console para mais detalhes.');
    }
  };

  // Calcular total
  const totalGastosFixos = Object.values(gastosFixos).reduce((total, valor) => total + valor, 0);

  const categorias = [
    { key: 'agua', nome: 'Água', icon: '💧' },
    { key: 'luz', nome: 'Luz', icon: '💡' },
    { key: 'internet', nome: 'Internet', icon: '🌐' },
    { key: 'renda', nome: 'Renda', icon: '🏠' }
  ];

  return (
    <div className="section">
      <div className="section-header">🏠 GASTOS FIXOS - {mes.nome.toUpperCase()}</div>
      <div className="section-content">
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(categoria => (
              <tr key={categoria.key}>
                <td>
                  {categoria.icon} {categoria.nome}
                </td>
                <td className="valor">
                  {editando === categoria.key ? (
                    <input
                      type="number"
                      value={gastosFixos[categoria.key]}
                      onChange={(e) => editarGasto(categoria.key, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          salvarGastos();
                        }
                      }}
                      style={{
                        width: '100px',
                        padding: '5px',
                        border: '1px solid #3498db',
                        borderRadius: '4px',
                        textAlign: 'right'
                      }}
                      autoFocus
                    />
                  ) : (
                    formatCurrency(gastosFixos[categoria.key])
                  )}
                </td>
                <td>
                  {editando === categoria.key ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={salvarGastos}
                        className="btn"
                        style={{
                          background: '#27ae60',
                          padding: '5px 10px',
                          fontSize: '12px'
                        }}
                        title="Salvar"
                      >
                        ✅
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="btn"
                        style={{
                          background: '#e74c3c',
                          padding: '5px 10px',
                          fontSize: '12px'
                        }}
                        title="Cancelar"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditando(categoria.key)}
                      className="btn"
                      style={{
                        background: '#3498db',
                        padding: '5px 10px',
                        fontSize: '12px'
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  )}
                </td>
              </tr>
            ))}
            <tr className="total">
              <td><strong>SUBTOTAL FIXOS</strong></td>
              <td className="valor"><strong>{formatCurrency(totalGastosFixos)}</strong></td>
              <td>
                <button
                  onClick={() => {
                    if (window.confirm('Restaurar valores padrão?')) {
                      setGastosFixos(gastosFixosDefault);
                      localStorage.removeItem('gastosFixos');
                    }
                  }}
                  className="btn"
                  style={{
                    background: '#f39c12',
                    padding: '5px 10px',
                    fontSize: '12px'
                  }}
                  title="Restaurar padrão"
                >
                  🔄
                </button>
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
          <p><strong>💡 Como usar:</strong></p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Clique em ✏️ para editar um valor</li>
            <li>Pressione Enter ou clique em ✅ para salvar</li>
            <li>Clique em ❌ para cancelar a edição</li>
            <li>Use 🔄 para restaurar valores padrão</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GastosFixosSection;
