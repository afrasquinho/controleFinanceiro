// src/components/DownloadSection.js
import React, { useRef } from 'react';
import { generateExcel, generateMonthReport } from '../utils/excelGenerator';

const DownloadSection = ({ 
  gastosData, 
  onExportData, 
  onImportData, 
  onClearAllData,
  currentMonth 
}) => {
  const fileInputRef = useRef(null);

  const handleGenerateExcel = () => {
    try {
      const fileName = generateExcel(gastosData);
      alert(`Excel gerado com sucesso: ${fileName}`);
    } catch (error) {
      alert('Erro ao gerar Excel: ' + error.message);
    }
  };

  const handleGenerateMonthReport = () => {
    try {
      const fileName = generateMonthReport(currentMonth, gastosData);
      alert(`Relatório mensal gerado: ${fileName}`);
    } catch (error) {
      alert('Erro ao gerar relatório: ' + error.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImportData(file);
      event.target.value = '';
    }
  };

  return (
    <div className="download-section">
      <h3>📁 Opções do Sistema</h3>
      
      <div className="download-buttons">
        <button 
          className="btn excel-btn" 
          onClick={handleGenerateExcel}
          title="Gerar planilha Excel com todos os meses"
        >
          📊 Gerar Excel Completo
        </button>
        
        <button 
          className="btn" 
          onClick={handleGenerateMonthReport}
          style={{ background: '#f39c12', fontSize: '16px', padding: '15px 30px' }}
          title="Gerar relatório detalhado do mês atual"
        >
          📋 Relatório do Mês
        </button>
        
        <button 
          className="btn export-btn" 
          onClick={onExportData}
          title="Exportar dados para backup"
        >
          💾 Exportar Dados
        </button>
        
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".json" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
        
        <button 
          className="btn import-btn" 
          onClick={handleImportClick}
          title="Importar dados de backup"
        >
          📂 Importar Dados
        </button>
        
        <button 
          className="btn clear-btn" 
          onClick={onClearAllData}
          title="Limpar todos os dados (irreversível)"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {/* Seção de informações */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '14px', 
        color: '#666' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '30px', 
          justifyContent: 'center' 
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <p><strong>💡 Funcionalidades:</strong></p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>📊 <strong>Excel Completo:</strong> Todos os meses + resumo anual</li>
              <li>📋 <strong>Relatório Mensal:</strong> Análise detalhada do mês atual</li>
              <li>💾 <strong>Backup:</strong> Exportar/importar dados em JSON</li>
              <li>🔄 <strong>Sincronização:</strong> Dados salvos automaticamente no Firebase</li>
            </ul>
          </div>
          
          <div style={{ flex: '1', minWidth: '250px' }}>
            <p><strong>🚀 Dicas de Uso:</strong></p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Os dados são salvos automaticamente na nuvem</li>
              <li>Acesse de qualquer dispositivo com internet</li>
              <li>Faça backup regular com "Exportar Dados"</li>
              <li>Use o relatório mensal para análises detalhadas</li>
            </ul>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f4fd', 
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p><strong>📱 Compatibilidade:</strong></p>
          <p style={{ margin: '5px 0' }}>
            ✅ Desktop • ✅ Tablet • ✅ Smartphone • ✅ Todos os navegadores modernos
          </p>
        </div>
      </div>

      {/* Status de conexão */}
      <div style={{ 
        marginTop: '15px', 
        textAlign: 'center',
        fontSize: '12px',
        color: '#27ae60',
        padding: '10px',
        backgroundColor: '#d5f4e6',
        borderRadius: '5px',
        border: '1px solid #27ae60'
      }}>
        🟢 <strong>Conectado ao Firebase</strong> - Dados sincronizados automaticamente
      </div>

      {/* Informações técnicas */}
      <div style={{ 
        marginTop: '15px', 
        fontSize: '11px', 
        color: '#999',
        textAlign: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '10px'
      }}>
        <p>
          <strong>Controle Financeiro 2025</strong> • 
          Versão 1.0 • 
          Desenvolvido com React + Firebase • 
          © {new Date().getFullYear()} André & Aline
        </p>
      </div>
    </div>
  );
};

export default DownloadSection;
