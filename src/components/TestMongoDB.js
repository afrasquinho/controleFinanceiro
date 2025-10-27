import React, { useState } from 'react';
import { useGastos, useRendimentos, useAnalytics } from '../hooks/useMongoDB.js';

const TestMongoDB = ({ user }) => {
  const [selectedMonth, setSelectedMonth] = useState('jan');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [newGasto, setNewGasto] = useState({ descricao: '', valor: '', categoria: 'outros' });

  const {
    gastos,
    loading: gastosLoading,
    error: gastosError,
    addGasto,
    updateGasto,
    deleteGasto
  } = useGastos(selectedMonth, selectedYear);

  const {
    rendimentos,
    loading: rendimentosLoading,
    error: rendimentosError,
    addRendimento,
    updateRendimento,
    deleteRendimento
  } = useRendimentos(selectedMonth, selectedYear);

  const {
    dashboard,
    trends,
    categories,
    loading: analyticsLoading,
    error: analyticsError
  } = useAnalytics(selectedMonth, selectedYear);

  const handleAddGasto = async (e) => {
    e.preventDefault();
    if (!newGasto.descricao || !newGasto.valor) return;

    try {
      await addGasto({
        descricao: newGasto.descricao,
        valor: parseFloat(newGasto.valor),
        categoria: newGasto.categoria,
        data: new Date()
      });
      setNewGasto({ descricao: '', valor: '', categoria: 'outros' });
    } catch (error) {
      console.error('Erro ao adicionar gasto:', error);
    }
  };

  const handleDeleteGasto = async (id) => {
    try {
      await deleteGasto(id);
    } catch (error) {
      console.error('Erro ao deletar gasto:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🍃 Teste MongoDB API</h1>
      <p>Usuário: {user.name} ({user.email})</p>

      {/* Controles */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Mês:
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="jan">Janeiro</option>
            <option value="fev">Fevereiro</option>
            <option value="mar">Março</option>
            <option value="abr">Abril</option>
            <option value="mai">Maio</option>
            <option value="jun">Junho</option>
            <option value="jul">Julho</option>
            <option value="ago">Agosto</option>
            <option value="set">Setembro</option>
            <option value="out">Outubro</option>
            <option value="nov">Novembro</option>
            <option value="dez">Dezembro</option>
          </select>
        </label>
        <label>
          Ano:
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            min="2020"
            max="2030"
          />
        </label>
      </div>

      {/* Adicionar Gasto */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>➕ Adicionar Gasto</h3>
        <form onSubmit={handleAddGasto} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Descrição"
            value={newGasto.descricao}
            onChange={(e) => setNewGasto({ ...newGasto, descricao: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Valor"
            value={newGasto.valor}
            onChange={(e) => setNewGasto({ ...newGasto, valor: e.target.value })}
            step="0.01"
            min="0"
            required
          />
          <select
            value={newGasto.categoria}
            onChange={(e) => setNewGasto({ ...newGasto, categoria: e.target.value })}
          >
            <option value="alimentacao">Alimentação</option>
            <option value="transporte">Transporte</option>
            <option value="saude">Saúde</option>
            <option value="educacao">Educação</option>
            <option value="lazer">Lazer</option>
            <option value="casa">Casa</option>
            <option value="vestuario">Vestuário</option>
            <option value="outros">Outros</option>
          </select>
          <button type="submit" disabled={gastosLoading}>
            {gastosLoading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {/* Status de Loading */}
      {(gastosLoading || rendimentosLoading || analyticsLoading) && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
          Carregando dados...
        </div>
      )}

      {/* Erros */}
      {(gastosError || rendimentosError || analyticsError) && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px' }}>
          <strong>Erros:</strong>
          {gastosError && <div>Gastos: {gastosError}</div>}
          {rendimentosError && <div>Rendimentos: {rendimentosError}</div>}
          {analyticsError && <div>Analytics: {analyticsError}</div>}
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboard && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📊 Dashboard Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>Total Gastos:</strong> €{dashboard.resumo?.totalGastos?.toFixed(2) || '0.00'}
            </div>
            <div>
              <strong>Total Rendimentos:</strong> €{dashboard.resumo?.totalRendimentos?.toFixed(2) || '0.00'}
            </div>
            <div>
              <strong>Saldo:</strong> €{dashboard.resumo?.saldo?.toFixed(2) || '0.00'}
            </div>
            <div>
              <strong>Total Transações:</strong> {dashboard.resumo?.totalTransacoes || 0}
            </div>
          </div>
        </div>
      )}

      {/* Gastos */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>💰 Gastos ({gastos.length})</h3>
        {gastos.length === 0 ? (
          <p>Nenhum gasto encontrado para {selectedMonth}/{selectedYear}</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {gastos.map((gasto) => (
              <div key={gasto._id} style={{ padding: '10px', background: '#f9f9f9', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{gasto.descricao}</strong> - {gasto.categoria}
                  <br />
                  <small>{new Date(gasto.data).toLocaleDateString('pt-PT')}</small>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>€{gasto.valor.toFixed(2)}</span>
                  <button onClick={() => handleDeleteGasto(gasto._id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rendimentos */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>💵 Rendimentos ({rendimentos.length})</h3>
        {rendimentos.length === 0 ? (
          <p>Nenhum rendimento encontrado para {selectedMonth}/{selectedYear}</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {rendimentos.map((rendimento) => (
              <div key={rendimento._id} style={{ padding: '10px', background: '#e8f5e8', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{rendimento.fonte}</strong> - {rendimento.tipo}
                  <br />
                  <small>{new Date(rendimento.data).toLocaleDateString('pt-PT')}</small>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>€{rendimento.valor.toFixed(2)}</span>
                  <button onClick={() => deleteRendimento(rendimento._id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics */}
      {categories && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📈 Analytics por Categoria</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {categories.categorias?.map((cat) => (
              <div key={cat._id} style={{ padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <strong>{cat._id}</strong>: €{cat.total.toFixed(2)} ({cat.percentual}%) - {cat.count} transações
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestMongoDB;
