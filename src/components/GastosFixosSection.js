// src/components/GastosFixosSection.js
import React, { useState, useEffect } from 'react';
import { gastosFixosDefault } from '../data/monthsData.js';
import { formatCurrency } from '../utils/calculations.js';
import { useUnifiedFirestore } from '../hooks/useUnifiedFirestore.js';

const GastosFixosSection = ({ mes }) => {
  // Hook do Firestore
  const { gastosFixos: firestoreGastosFixos, updateGastosFixos } = useUnifiedFirestore();
  
  // Estado para gastos fixos editáveis
  const [gastosFixos, setGastosFixos] = useState(gastosFixosDefault);
  
  // Estado para controlar qual campo está sendo editado
  const [editando, setEditando] = useState(null);

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

  // Carregar gastos do Firestore ao inicializar
  useEffect(() => {
    // Check if we have fixed expenses data for this specific month
    if (firestoreGastosFixos && firestoreGastosFixos[mes.id]) {
      // Check if the data is an object with keys (actual data) or an empty object
      if (Object.keys(firestoreGastosFixos[mes.id]).length > 0) {
        setGastosFixos(firestoreGastosFixos[mes.id]);
      } else {
        // If empty object, use default values
        setGastosFixos(gastosFixosDefault);
      }
    } else {
      // If no data for this month, use default values
      setGastosFixos(gastosFixosDefault);
    }
  }, [firestoreGastosFixos, mes.id]);

  // Função para editar um gasto com validação
  const editarGasto = (categoria, novoValor) => {
    const numValue = parseFloat(novoValor);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100000) {
      setGastosFixos(prev => ({
        ...prev,
        [categoria]: numValue
      }));
    } else if (novoValor === '' || novoValor === '0') {
      setGastosFixos(prev => ({
        ...prev,
        [categoria]: 0
      }));
    }
    // If invalid, don't update the state
  };

  // Função para salvar no Firestore
  const salvarGastos = async () => {
    try {
      await updateGastosFixos(mes.id, gastosFixos);
      setEditando(null);
      showNotification('✅ Gastos fixos salvos com sucesso!', 'success');
    } catch (error) {
      showNotification('❌ Erro ao salvar gastos fixos. Tente novamente.', 'error');
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