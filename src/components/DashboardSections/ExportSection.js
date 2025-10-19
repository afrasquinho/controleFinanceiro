import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/calculations.js';

const ExportSection = ({ gastosData, rendimentosData, gastosFixos }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportPeriod, setExportPeriod] = useState('all');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);

  // Preparar dados para exportação
  const exportData = useMemo(() => {
    const mesesNomes = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };

    const dados = {
      gastos: [],
      rendimentos: [],
      resumo: {},
      analise: {}
    };

    // Processar gastos
    if (gastosData && typeof gastosData === 'object') {
      Object.entries(gastosData).forEach(([mesId, gastos]) => {
        if (!gastos || !Array.isArray(gastos) || gastos.length === 0) return;

        gastos.forEach(gasto => {
          if (gasto && typeof gasto === 'object' && typeof gasto.valor === 'number') {
            dados.gastos.push({
              mes: mesesNomes[mesId] || mesId,
              data: gasto.data || '',
              descricao: gasto.desc || '',
              valor: gasto.valor,
              categoria: gasto.categoria || 'outros',
              tag: gasto.tag || ''
            });
          }
        });
      });
    }

    // Processar rendimentos
    if (rendimentosData && typeof rendimentosData === 'object') {
      Object.entries(rendimentosData).forEach(([mesId, rendimentos]) => {
        if (!rendimentos || !Array.isArray(rendimentos) || rendimentos.length === 0) return;

        rendimentos.forEach(rendimento => {
          if (rendimento && typeof rendimento === 'object' && typeof rendimento.valor === 'number') {
            dados.rendimentos.push({
              mes: mesesNomes[mesId] || mesId,
              fonte: rendimento.fonte || '',
              valor: rendimento.valor,
              descricao: rendimento.descricao || ''
            });
          }
        });
      });
    }

    // Calcular resumo
    const totalGastos = dados.gastos.reduce((sum, gasto) => sum + gasto.valor, 0);
    const totalRendimentos = dados.rendimentos.reduce((sum, rend) => sum + rend.valor, 0);
    const saldo = totalRendimentos - totalGastos;

    dados.resumo = {
      totalGastos,
      totalRendimentos,
      saldo,
      totalTransacoes: dados.gastos.length,
      mediaGastos: dados.gastos.length > 0 ? totalGastos / dados.gastos.length : 0
    };

    // Análise por categoria
    const gastosPorCategoria = {};
    dados.gastos.forEach(gasto => {
      const categoria = gasto.categoria;
      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = { total: 0, count: 0 };
      }
      gastosPorCategoria[categoria].total += gasto.valor;
      gastosPorCategoria[categoria].count += 1;
    });

    dados.analise = {
      gastosPorCategoria,
      categoriaMaior: Object.entries(gastosPorCategoria)
        .sort(([,a], [,b]) => b.total - a.total)[0],
      categoriaMenor: Object.entries(gastosPorCategoria)
        .sort(([,a], [,b]) => a.total - b.total)[0]
    };

    return dados;
  }, [gastosData, rendimentosData, gastosFixos]);

  // Gerar Excel (CSV)
  const generateExcel = () => {
    const dados = exportData;
    
    // Cabeçalho do CSV
    let csvContent = 'Controle Financeiro 2025\n\n';
    
    // Resumo
    csvContent += 'RESUMO GERAL\n';
    csvContent += `Total de Gastos,${formatCurrency(dados.resumo.totalGastos).replace('€', '').replace('.', ',')}\n`;
    csvContent += `Total de Rendimentos,${formatCurrency(dados.resumo.totalRendimentos).replace('€', '').replace('.', ',')}\n`;
    csvContent += `Saldo,${formatCurrency(dados.resumo.saldo).replace('€', '').replace('.', ',')}\n`;
    csvContent += `Total de Transações,${dados.resumo.totalTransacoes}\n`;
    csvContent += `Média por Gasto,${formatCurrency(dados.resumo.mediaGastos).replace('€', '').replace('.', ',')}\n\n`;
    
    // Análise por categoria
    if (includeAnalysis) {
      csvContent += 'ANÁLISE POR CATEGORIA\n';
      csvContent += 'Categoria,Total,Quantidade,Percentual\n';
      Object.entries(dados.analise.gastosPorCategoria).forEach(([categoria, info]) => {
        const percentual = dados.resumo.totalGastos > 0 ? 
          ((info.total / dados.resumo.totalGastos) * 100).toFixed(1) : 0;
        csvContent += `${categoria},${formatCurrency(info.total).replace('€', '').replace('.', ',')},${info.count},${percentual}%\n`;
      });
      csvContent += '\n';
    }
    
    // Gastos detalhados
    csvContent += 'GASTOS DETALHADOS\n';
    csvContent += 'Mês,Data,Descrição,Categoria,Tag,Valor\n';
    dados.gastos.forEach(gasto => {
      csvContent += `${gasto.mes},${gasto.data},${gasto.descricao},${gasto.categoria},${gasto.tag},${formatCurrency(gasto.valor).replace('€', '').replace('.', ',')}\n`;
    });
    csvContent += '\n';
    
    // Rendimentos detalhados
    if (dados.rendimentos.length > 0) {
      csvContent += 'RENDIMENTOS DETALHADOS\n';
      csvContent += 'Mês,Fonte,Descrição,Valor\n';
      dados.rendimentos.forEach(rendimento => {
        csvContent += `${rendimento.mes},${rendimento.fonte},${rendimento.descricao},${formatCurrency(rendimento.valor).replace('€', '').replace('.', ',')}\n`;
      });
    }

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `controle_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Gerar PDF (simulado)
  const generatePDF = () => {
    const dados = exportData;
    
    // Criar conteúdo HTML para conversão
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Controle Financeiro 2025</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { font-weight: bold; background-color: #f9f9f9; }
          .summary { background-color: #e8f4fd; padding: 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 Controle Financeiro 2025</h1>
          <p>Relatório gerado em ${new Date().toLocaleDateString('pt-PT')}</p>
        </div>
        
        <div class="section summary">
          <h2>📊 Resumo Geral</h2>
          <p><strong>Total de Gastos:</strong> ${formatCurrency(dados.resumo.totalGastos)}</p>
          <p><strong>Total de Rendimentos:</strong> ${formatCurrency(dados.resumo.totalRendimentos)}</p>
          <p><strong>Saldo:</strong> ${formatCurrency(dados.resumo.saldo)}</p>
          <p><strong>Total de Transações:</strong> ${dados.resumo.totalTransacoes}</p>
          <p><strong>Média por Gasto:</strong> ${formatCurrency(dados.resumo.mediaGastos)}</p>
        </div>
        
        ${includeAnalysis ? `
        <div class="section">
          <h2>📈 Análise por Categoria</h2>
          <table>
            <tr><th>Categoria</th><th>Total</th><th>Quantidade</th><th>Percentual</th></tr>
            ${Object.entries(dados.analise.gastosPorCategoria).map(([categoria, info]) => {
              const percentual = dados.resumo.totalGastos > 0 ? 
                ((info.total / dados.resumo.totalGastos) * 100).toFixed(1) : 0;
              return `<tr><td>${categoria}</td><td>${formatCurrency(info.total)}</td><td>${info.count}</td><td>${percentual}%</td></tr>`;
            }).join('')}
          </table>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>🛒 Gastos Detalhados</h2>
          <table>
            <tr><th>Mês</th><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr>
            ${dados.gastos.map(gasto => 
              `<tr><td>${gasto.mes}</td><td>${gasto.data}</td><td>${gasto.descricao}</td><td>${gasto.categoria}</td><td>${formatCurrency(gasto.valor)}</td></tr>`
            ).join('')}
          </table>
        </div>
        
        ${dados.rendimentos.length > 0 ? `
        <div class="section">
          <h2>💼 Rendimentos Detalhados</h2>
          <table>
            <tr><th>Mês</th><th>Fonte</th><th>Descrição</th><th>Valor</th></tr>
            ${dados.rendimentos.map(rendimento => 
              `<tr><td>${rendimento.mes}</td><td>${rendimento.fonte}</td><td>${rendimento.descricao}</td><td>${formatCurrency(rendimento.valor)}</td></tr>`
            ).join('')}
          </table>
        </div>
        ` : ''}
      </body>
      </html>
    `;

    // Abrir em nova janela para impressão
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.print();
  };

  // Gerar JSON
  const generateJSON = () => {
    const dados = exportData;
    const jsonContent = JSON.stringify(dados, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `controle_financeiro_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'excel':
        generateExcel();
        break;
      case 'pdf':
        generatePDF();
        break;
      case 'json':
        generateJSON();
        break;
      default:
        generateExcel();
    }
  };

  return (
    <div className="export-section">
      <div className="section-header">
        <h1>📤 Exportação de Dados</h1>
        <p>Exporte seus dados financeiros em diferentes formatos para análise externa</p>
      </div>

      <div className="export-options">
        <div className="export-format">
          <h3>📄 Formato de Exportação</h3>
          <div className="format-options">
            <label className="format-option">
              <input
                type="radio"
                value="excel"
                checked={exportFormat === 'excel'}
                onChange={(e) => setExportFormat(e.target.value)}
              />
              <div className="format-card">
                <div className="format-icon">📊</div>
                <div className="format-info">
                  <h4>Excel/CSV</h4>
                  <p>Compatível com Excel, Google Sheets</p>
                </div>
              </div>
            </label>

            <label className="format-option">
              <input
                type="radio"
                value="pdf"
                checked={exportFormat === 'pdf'}
                onChange={(e) => setExportFormat(e.target.value)}
              />
              <div className="format-card">
                <div className="format-icon">📄</div>
                <div className="format-info">
                  <h4>PDF</h4>
                  <p>Relatório formatado para impressão</p>
                </div>
              </div>
            </label>

            <label className="format-option">
              <input
                type="radio"
                value="json"
                checked={exportFormat === 'json'}
                onChange={(e) => setExportFormat(e.target.value)}
              />
              <div className="format-card">
                <div className="format-icon">🔧</div>
                <div className="format-info">
                  <h4>JSON</h4>
                  <p>Dados estruturados para desenvolvedores</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="export-settings">
          <h3>⚙️ Configurações</h3>
          <div className="settings-grid">
            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeAnalysis}
                onChange={(e) => setIncludeAnalysis(e.target.checked)}
              />
              <span>Incluir análise por categoria</span>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              <span>Incluir gráficos (PDF)</span>
            </label>
          </div>
        </div>

        <div className="export-preview">
          <h3>👁️ Pré-visualização</h3>
          <div className="preview-content">
            <div className="preview-stats">
              <div className="preview-stat">
                <span className="stat-label">Total de Gastos:</span>
                <span className="stat-value">{formatCurrency(exportData.resumo.totalGastos)}</span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">Total de Transações:</span>
                <span className="stat-value">{exportData.resumo.totalTransacoes}</span>
              </div>
              <div className="preview-stat">
                <span className="stat-label">Categorias:</span>
                <span className="stat-value">{Object.keys(exportData.analise.gastosPorCategoria).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button 
            className="export-btn"
            onClick={handleExport}
          >
            📤 Exportar Dados
          </button>
          
          <div className="export-info">
            <p>📋 <strong>Incluído no relatório:</strong></p>
            <ul>
              <li>✅ Resumo financeiro geral</li>
              {includeAnalysis && <li>✅ Análise por categoria</li>}
              <li>✅ Lista detalhada de gastos</li>
              <li>✅ Lista de rendimentos</li>
              {includeCharts && exportFormat === 'pdf' && <li>✅ Gráficos e visualizações</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSection;
