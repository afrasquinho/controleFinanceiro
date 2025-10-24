import React, { useState, useRef } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const ImportSection = ({ onImportData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importStep, setImportStep] = useState('upload'); // upload, mapping, preview, complete
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  // Categorias disponíveis
  const categorias = {
    'alimentacao': '🍽️ Alimentação',
    'transporte': '🚗 Transporte',
    'saude': '🏥 Saúde',
    'educacao': '📚 Educação',
    'lazer': '🎬 Lazer',
    'casa': '🏠 Casa',
    'vestuario': '👕 Vestuário',
    'outros': '📦 Outros'
  };

  // Campos necessários
  const requiredFields = {
    'data': 'Data da Transação',
    'descricao': 'Descrição',
    'valor': 'Valor',
    'categoria': 'Categoria'
  };

  // Detectar formato do CSV
  const detectCSVFormat = (data) => {
    const sample = data.slice(0, 3);
    const formats = {
      'n26': {
        name: 'N26 Bank',
        patterns: ['Date', 'Recipient', 'Transaction type', 'Payment reference', 'Amount (EUR)', 'Amount (Foreign Currency)', 'Type Foreign Currency', 'Exchange Rate'],
        confidence: 0
      },
      'revolut': {
        name: 'Revolut',
        patterns: ['Type', 'Product', 'Started Date', 'Completed Date', 'Description', 'Amount', 'Fee', 'Currency', 'State'],
        confidence: 0
      },
      'generic': {
        name: 'Formato Genérico',
        patterns: ['Data', 'Descrição', 'Valor', 'Categoria'],
        confidence: 0
      }
    };

    // Calcular confiança para cada formato
    Object.keys(formats).forEach(formatKey => {
      const format = formats[formatKey];
      const headerMatches = format.patterns.filter(pattern => 
        sample[0].some(header => 
          header.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(header.toLowerCase())
        )
      ).length;
      format.confidence = headerMatches / format.patterns.length;
    });

    // Retornar formato com maior confiança
    return Object.entries(formats).reduce((best, [key, format]) => 
      format.confidence > best.confidence ? { key, ...format } : best
    , { key: 'generic', confidence: 0 });
  };

  // Processar arquivo CSV
  const processCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('Arquivo CSV deve ter pelo menos 2 linhas (cabeçalho + dados)');
        return;
      }

      // Detectar separador
      const separators = [',', ';', '\t'];
      const separator = separators.find(sep => lines[0].split(sep).length > 1) || ',';

      // Processar linhas
      const rows = lines.map(line => 
        line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, ''))
      );

      const headers = rows[0];
      const data = rows.slice(1).map((row, index) => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i] || '';
        });
        obj._rowIndex = index;
        return obj;
      });

      setHeaders(headers);
      setCsvData(data);

      // Detectar formato automaticamente
      const detectedFormat = detectCSVFormat([headers]);
      if (detectedFormat.confidence > 0.5) {
        autoMapFields(headers, detectedFormat.key);
      }

      setImportStep('mapping');
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Mapeamento automático de campos
  const autoMapFields = (headers, format) => {
    const autoMapping = {};

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      // Mapear data
      if (lowerHeader.includes('date') || lowerHeader.includes('data')) {
        autoMapping[header] = 'data';
      }
      // Mapear descrição
      else if (lowerHeader.includes('description') || lowerHeader.includes('descrição') || 
               lowerHeader.includes('recipient') || lowerHeader.includes('reference')) {
        autoMapping[header] = 'descricao';
      }
      // Mapear valor
      else if (lowerHeader.includes('amount') || lowerHeader.includes('valor')) {
        autoMapping[header] = 'valor';
      }
      // Mapear categoria
      else if (lowerHeader.includes('category') || lowerHeader.includes('categoria') ||
               lowerHeader.includes('type')) {
        autoMapping[header] = 'categoria';
      }
    });

    setMapping(autoMapping);
  };

  // Validar dados mapeados
  const validateMappedData = () => {
    const errors = [];
    const warnings = [];

    csvData.forEach((row, index) => {
      // Verificar campos obrigatórios e validar dados
      Object.entries(mapping).forEach(([csvField, requiredField]) => {
        if (requiredFields[requiredField] && !row[csvField]) {
          errors.push(`Linha ${index + 2}: Campo ${requiredField} está vazio`);
        }

        // Validar data
        if (requiredField === 'data' && row[csvField]) {
          const date = new Date(row[csvField]);
          if (isNaN(date.getTime())) {
            errors.push(`Linha ${index + 2}: Data inválida: ${row[csvField]}`);
          }
        }

        // Validar valor
        if (requiredField === 'valor' && row[csvField]) {
          const valor = parseFloat(row[csvField].replace(/[^\d.,-]/g, '').replace(',', '.'));
          if (isNaN(valor)) {
            errors.push(`Linha ${index + 2}: Valor inválido: ${row[csvField]}`);
          }
        }
      });

    });

    return { errors, warnings };
  };

  // Converter dados mapeados para formato da aplicação
  const convertMappedData = () => {
    const convertedData = [];

    csvData.forEach(row => {
      const convertedRow = {};
      
      Object.entries(mapping).forEach(([csvField, requiredField]) => {
        if (requiredField === 'data') {
          const date = new Date(row[csvField]);
          convertedRow.data = date.toISOString().split('T')[0];
        } else if (requiredField === 'valor') {
          const valor = parseFloat(row[csvField].replace(/[^\d.,-]/g, '').replace(',', '.'));
          convertedRow.valor = isNaN(valor) ? 0 : valor;
        } else if (requiredField === 'categoria') {
          const categoria = row[csvField].toLowerCase();
          // Tentar mapear categoria automaticamente
          const mappedCategory = Object.keys(categorias).find(cat => 
            categoria.includes(cat) || categorias[cat].toLowerCase().includes(categoria)
          );
          convertedRow.categoria = mappedCategory || 'outros';
        } else {
          convertedRow[requiredField] = row[csvField];
        }
      });

      // Adicionar timestamp
      convertedRow.timestamp = new Date().toISOString();

      convertedData.push(convertedRow);
    });

    return convertedData;
  };

  // Processar importação
  const processImport = () => {
    const validation = validateMappedData();
    
    if (validation.errors.length > 0) {
      alert(`Erros encontrados:\n${validation.errors.join('\n')}`);
      return;
    }

    const convertedData = convertMappedData();
    const results = {
      total: convertedData.length,
      success: convertedData.filter(row => row.valor > 0).length,
      errors: convertedData.filter(row => row.valor <= 0).length,
      categories: [...new Set(convertedData.map(row => row.categoria))],
      totalValue: convertedData.reduce((sum, row) => sum + row.valor, 0)
    };

    setImportResults(results);
    setImportStep('preview');

    // Se não há erros, importar automaticamente
    if (results.errors === 0) {
      onImportData(convertedData);
      setImportStep('complete');
    }
  };

  // Handlers de drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFile) {
      processCSV(csvFile);
    } else {
      alert('Por favor, selecione um arquivo CSV válido.');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processCSV(file);
    }
  };

  const resetImport = () => {
    setImportStep('upload');
    setCsvData([]);
    setHeaders([]);
    setMapping({});
    setImportResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="import-section">
      <div className="section-header">
        <h1>📥 Importação de Dados</h1>
        <p>Importe extratos bancários em formato CSV para análise automática</p>
      </div>

      {/* Step 1: Upload */}
      {importStep === 'upload' && (
        <div className="upload-step">
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <h3>Arraste seu arquivo CSV aqui</h3>
              <p>ou clique para selecionar</p>
              <div className="supported-formats">
                <span>Formatos suportados:</span>
                <div className="format-badges">
                  <span className="badge">N26</span>
                  <span className="badge">Revolut</span>
                  <span className="badge">Genérico</span>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          <div className="import-instructions">
            <h3>📋 Instruções de Importação</h3>
            <div className="instructions-grid">
              <div className="instruction-card">
                <div className="card-icon">1️⃣</div>
                <h4>Prepare seu arquivo</h4>
                <p>Exporte seus dados bancários em formato CSV</p>
              </div>
              <div className="instruction-card">
                <div className="card-icon">2️⃣</div>
                <h4>Mapeie os campos</h4>
                <p>Conecte as colunas do CSV aos campos da aplicação</p>
              </div>
              <div className="instruction-card">
                <div className="card-icon">3️⃣</div>
                <h4>Revise e importe</h4>
                <p>Verifique os dados e confirme a importação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Mapping */}
      {importStep === 'mapping' && (
        <div className="mapping-step">
          <h3>🔗 Mapeamento de Campos</h3>
          <p>Conecte as colunas do seu CSV aos campos necessários</p>
          
          <div className="mapping-grid">
            {Object.entries(requiredFields).map(([fieldKey, fieldLabel]) => (
              <div key={fieldKey} className="mapping-item">
                <label className="field-label">
                  {fieldLabel} {fieldKey === 'data' || fieldKey === 'descricao' || fieldKey === 'valor' ? '*' : ''}
                </label>
                <select
                  value={Object.keys(mapping).find(key => mapping[key] === fieldKey) || ''}
                  onChange={(e) => {
                    const newMapping = { ...mapping };
                    // Remover mapeamento anterior
                    Object.keys(newMapping).forEach(key => {
                      if (newMapping[key] === fieldKey) {
                        delete newMapping[key];
                      }
                    });
                    // Adicionar novo mapeamento
                    if (e.target.value) {
                      newMapping[e.target.value] = fieldKey;
                    }
                    setMapping(newMapping);
                  }}
                >
                  <option value="">Selecione uma coluna...</option>
                  {headers.map(header => (
                    <option key={header} value={header}>{header}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mapping-actions">
            <button onClick={resetImport} className="btn btn-secondary">
              ← Voltar
            </button>
            <button 
              onClick={processImport} 
              className="btn btn-primary"
              disabled={!mapping.data || !mapping.descricao || !mapping.valor}
            >
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {importStep === 'preview' && importResults && (
        <div className="preview-step">
          <h3>👀 Pré-visualização dos Dados</h3>
          
          <div className="import-summary">
            <div className="summary-cards">
              <div className="summary-card success">
                <div className="card-icon">✅</div>
                <div className="card-content">
                  <h4>Sucessos</h4>
                  <p>{importResults.success}</p>
                </div>
              </div>
              <div className="summary-card error">
                <div className="card-icon">❌</div>
                <div className="card-content">
                  <h4>Erros</h4>
                  <p>{importResults.errors}</p>
                </div>
              </div>
              <div className="summary-card info">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h4>Valor Total</h4>
                  <p>{formatCurrency(importResults.totalValue)}</p>
                </div>
              </div>
              <div className="summary-card info">
                <div className="card-icon">📂</div>
                <div className="card-content">
                  <h4>Categorias</h4>
                  <p>{importResults.categories.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="preview-actions">
            <button onClick={resetImport} className="btn btn-secondary">
              ← Voltar
            </button>
            <button 
              onClick={() => {
                onImportData(convertMappedData());
                setImportStep('complete');
              }} 
              className="btn btn-primary"
            >
              Importar Dados →
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {importStep === 'complete' && (
        <div className="complete-step">
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h3>Importação Concluída!</h3>
            <p>Seus dados foram importados com sucesso e estão prontos para análise.</p>
            
            <div className="success-actions">
              <button onClick={resetImport} className="btn btn-primary">
                Importar Mais Dados
              </button>
              <button 
                onClick={() => window.location.href = '#overview'} 
                className="btn btn-secondary"
              >
                Ver Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportSection;
