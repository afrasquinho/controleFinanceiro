import React, { useState, useMemo } from 'react';
import { calculateGastosVariaveis, formatCurrency } from '../utils/calculations.js';

const GastosVariaveisEnhanced = ({ mes, gastos, onAddGasto, onRemoveGasto }) => {
  const [formData, setFormData] = useState({
    data: `2025-${String(mes.numero).padStart(2, '0')}-01`,
    desc: '',
    valor: '',
    categoria: '',
    tag: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [filterCategory, setFilterCategory] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('data');

  // Categorias inteligentes com sugestões
  const categorias = {
    'alimentacao': { nome: '🍽️ Alimentação', cor: '#ff6b6b', keywords: ['comida', 'restaurante', 'supermercado', 'padaria', 'lanche', 'jantar', 'almoço', 'café'] },
    'transporte': { nome: '🚗 Transporte', cor: '#4ecdc4', keywords: ['gasolina', 'uber', 'taxi', 'metro', 'ônibus', 'combustível', 'estacionamento', 'bilhete'] },
    'saude': { nome: '🏥 Saúde', cor: '#45b7d1', keywords: ['farmacia', 'médico', 'hospital', 'medicamento', 'consulta', 'exame', 'dentista'] },
    'educacao': { nome: '📚 Educação', cor: '#96ceb4', keywords: ['curso', 'livro', 'escola', 'universidade', 'material', 'aula', 'treinamento'] },
    'lazer': { nome: '🎬 Lazer', cor: '#feca57', keywords: ['cinema', 'teatro', 'show', 'festa', 'viagem', 'hotel', 'entretenimento', 'jogo'] },
    'casa': { nome: '🏠 Casa', cor: '#ff9ff3', keywords: ['luz', 'água', 'gás', 'internet', 'telefone', 'condomínio', 'reforma', 'decoração'] },
    'vestuario': { nome: '👕 Vestuário', cor: '#54a0ff', keywords: ['roupa', 'sapato', 'acessório', 'moda', 'loja', 'shopping'] },
    'outros': { nome: '📦 Outros', cor: '#5f27cd', keywords: [] }
  };

  // Templates de gastos frequentes
  const templates = [
    { nome: 'Almoço', valor: '15', categoria: 'alimentacao', desc: 'Almoço' },
    { nome: 'Gasolina', valor: '50', categoria: 'transporte', desc: 'Gasolina' },
    { nome: 'Supermercado', valor: '100', categoria: 'alimentacao', desc: 'Supermercado' },
    { nome: 'Farmácia', valor: '25', categoria: 'saude', desc: 'Farmácia' },
    { nome: 'Uber', valor: '12', categoria: 'transporte', desc: 'Uber' },
    { nome: 'Cinema', valor: '20', categoria: 'lazer', desc: 'Cinema' },
    { nome: 'Conta de Luz', valor: '80', categoria: 'casa', desc: 'Conta de Luz' },
    { nome: 'Livro', valor: '30', categoria: 'educacao', desc: 'Livro' }
  ];

  // Sugerir categoria baseada na descrição
  const sugerirCategoria = (descricao) => {
    const desc = descricao.toLowerCase();
    for (const [categoriaId, categoria] of Object.entries(categorias)) {
      if (categoria.keywords.some(keyword => desc.includes(keyword))) {
        return categoriaId;
      }
    }
    return 'outros';
  };

  // Aplicar template
  const aplicarTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      desc: template.desc,
      valor: template.valor,
      categoria: template.categoria
    }));
    setShowTemplates(false);
  };

  // Validação melhorada
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
    const categoriaSelecionada = formData.categoria || sugerirCategoria(sanitizedDesc);

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

    // Adicionar categoria e tag ao gasto - usando formato compatível com o sistema existente
    const gastoCompleto = {
      data: formData.data,
      desc: sanitizedDesc,
      valor: parseFloat(sanitizedValor),
      categoria: categoriaSelecionada,
      tag: formData.tag || ''
    };

    // Usar a função onAddGasto com os parâmetros corretos
    onAddGasto(mes.id, gastoCompleto.data, gastoCompleto.desc, gastoCompleto.valor);
    
    setFormData({ 
      data: `2025-${String(mes.numero).padStart(2, '0')}-01`,
      desc: '', 
      valor: '', 
      categoria: '',
      tag: ''
    });
  };

  // Filtrar e ordenar gastos
  const gastosFiltrados = useMemo(() => {
    let filtrados = gastos.filter(gasto => {
      const matchCategory = filterCategory === 'todas' || gasto.categoria === filterCategory;
      const matchSearch = searchTerm === '' || 
        gasto.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gasto.tag && gasto.tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });

    // Ordenar
    filtrados.sort((a, b) => {
      switch (sortBy) {
        case 'data':
          return new Date(b.data) - new Date(a.data);
        case 'valor':
          return b.valor - a.valor;
        case 'categoria':
          return (a.categoria || '').localeCompare(b.categoria || '');
        default:
          return 0;
      }
    });

    return filtrados;
  }, [gastos, filterCategory, searchTerm, sortBy]);

  // Calcular estatísticas por categoria
  const estatisticasCategoria = useMemo(() => {
    const stats = {};
    gastos.forEach(gasto => {
      const categoria = gasto.categoria || 'outros';
      if (!stats[categoria]) {
        stats[categoria] = { total: 0, count: 0 };
      }
      stats[categoria].total += gasto.valor;
      stats[categoria].count += 1;
    });
    return stats;
  }, [gastos]);

  const totalGastosVariaveis = calculateGastosVariaveis(gastos);

  return (
    <div className="section enhanced-gastos">
      <div className="section-header">
        🛒 GASTOS VARIÁVEIS - {mes.nome.toUpperCase()}
        <div className="header-actions">
          <button 
            onClick={() => setShowTemplates(!showTemplates)}
            className="btn btn-secondary"
            title="Templates de gastos"
          >
            📋 Templates
          </button>
        </div>
      </div>

      {/* Templates de Gastos */}
      {showTemplates && (
        <div className="templates-section">
          <h4>📋 Templates de Gastos Frequentes</h4>
          <div className="templates-grid">
            {templates.map((template, index) => (
              <button
                key={index}
                className="template-btn"
                onClick={() => aplicarTemplate(template)}
                style={{ borderLeftColor: categorias[template.categoria]?.cor }}
              >
                <span className="template-nome">{template.nome}</span>
                <span className="template-valor">{formatCurrency(template.valor)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Categoria:</label>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todas</option>
            {Object.entries(categorias).map(([id, categoria]) => (
              <option key={id} value={id}>{categoria.nome}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            placeholder="Descrição ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Ordenar:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="data">Data</option>
            <option value="valor">Valor</option>
            <option value="categoria">Categoria</option>
          </select>
        </div>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="category-stats">
        <h4>📊 Gastos por Categoria</h4>
        <div className="stats-grid">
          {Object.entries(estatisticasCategoria).map(([categoriaId, stats]) => {
            const categoria = categorias[categoriaId] || categorias.outros;
            const percentage = totalGastosVariaveis > 0 ? (stats.total / totalGastosVariaveis) * 100 : 0;
            
            return (
              <div key={categoriaId} className="stat-card" style={{ borderLeftColor: categoria.cor }}>
                <div className="stat-header">
                  <span className="stat-category">{categoria.nome}</span>
                  <span className="stat-count">{stats.count} gastos</span>
                </div>
                <div className="stat-value">{formatCurrency(stats.total)}</div>
                <div className="stat-percentage">{percentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista de Gastos */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tag</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {gastosFiltrados.length > 0 ? (
              gastosFiltrados.map((gasto, index) => {
                const categoria = categorias[gasto.categoria] || categorias.outros;
                return (
                  <tr key={index}>
                    <td>{gasto.data}</td>
                    <td>{gasto.desc}</td>
                    <td>
                      <span 
                        className="categoria-badge" 
                        style={{ backgroundColor: categoria.cor }}
                      >
                        {categoria.nome}
                      </span>
                    </td>
                    <td>{gasto.tag && <span className="tag">{gasto.tag}</span>}</td>
                    <td className="valor">{formatCurrency(gasto.valor)}</td>
                    <td>
                      <button 
                        onClick={() => onRemoveGasto(mes.id, index)}
                        className="remove-btn"
                        title="Remover gasto"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                  {searchTerm || filterCategory !== 'todas' 
                    ? 'Nenhum gasto encontrado com os filtros aplicados'
                    : 'Nenhum gasto variável registrado'
                  }
                </td>
              </tr>
            )}
            <tr className="total">
              <td colSpan="4"><strong>SUBTOTAL VARIÁVEIS</strong></td>
              <td className="valor">
                <strong>{formatCurrency(totalGastosVariaveis)}</strong>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
        
      {/* Formulário de Adição */}
      <form onSubmit={handleSubmit} className="enhanced-form">
        <div className="form-row">
          <div className="form-group">
            <label>Data:</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
              required
            />
            {formErrors.data && <div className="error-message">{formErrors.data}</div>}
          </div>

          <div className="form-group">
            <label>Descrição:</label>
            <input
              type="text"
              placeholder="Descrição do gasto"
              value={formData.desc}
              onChange={(e) => {
                setFormData({...formData, desc: e.target.value});
                if (!formData.categoria) {
                  setFormData(prev => ({...prev, categoria: sugerirCategoria(e.target.value)}));
                }
              }}
              required
            />
            {formErrors.desc && <div className="error-message">{formErrors.desc}</div>}
          </div>

          <div className="form-group">
            <label>Valor:</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: e.target.value})}
              required
            />
            {formErrors.valor && <div className="error-message">{formErrors.valor}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoria:</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="categoria-select"
            >
              <option value="">Auto-detectar</option>
              {Object.entries(categorias).map(([id, categoria]) => (
                <option key={id} value={id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tag (opcional):</label>
            <input
              type="text"
              placeholder="Ex: urgente, trabalho, pessoal"
              value={formData.tag}
              onChange={(e) => setFormData({...formData, tag: e.target.value})}
              maxLength="20"
            />
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              ➕ Adicionar Gasto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default GastosVariaveisEnhanced;
