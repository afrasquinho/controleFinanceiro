// src/hooks/useFinanceData.js
import { useState, useEffect, useCallback } from 'react';
import { analyzeWithAI } from '../utils/aiAdvanced';

export const useFinanceData = () => {
  const [gastosData, setGastosData] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('gastosData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setGastosData(parsedData);
        
        // Analisar com IA automaticamente
        setTimeout(() => {
          const analysis = analyzeWithAI(parsedData);
          setAiAnalysis(analysis);
        }, 500);
      }
    } catch (err) {
      setError('Erro ao carregar dados salvos');
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar dados no localStorage
  const saveData = useCallback((newData) => {
    try {
      localStorage.setItem('gastosData', JSON.stringify(newData));
      setGastosData(newData);
      
      // Re-analisar com IA
      const analysis = analyzeWithAI(newData);
      setAiAnalysis(analysis);
    } catch (err) {
      setError('Erro ao salvar dados');
      console.error('Erro ao salvar:', err);
    }
  }, []);

  // Adicionar gasto
  const addGasto = useCallback((mesId, data, desc, valor) => {
    const newGasto = {
      data,
      desc: desc.trim(),
      valor: parseFloat(valor),
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    const newData = {
      ...gastosData,
      [mesId]: [...(gastosData[mesId] || []), newGasto]
    };

    saveData(newData);
  }, [gastosData, saveData]);

  // Remover gasto
  const removeGasto = useCallback((mesId, index) => {
    const newData = {
      ...gastosData,
      [mesId]: gastosData[mesId].filter((_, i) => i !== index)
    };

    saveData(newData);
  }, [gastosData, saveData]);

  // Exportar dados
  const exportData = useCallback(() => {
    const dataToExport = {
      gastosData,
      aiAnalysis: aiAnalysis ? {
        healthScore: aiAnalysis.healthScore,
        insights: aiAnalysis.insights.slice(0, 3),
        predictions: aiAnalysis.predictions
      } : null,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gastosData, aiAnalysis]);

  // Importar dados
  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.gastosData) {
          saveData(importedData.gastosData);
        } else {
          // Formato antigo
          saveData(importedData);
        }
      } catch (err) {
        setError('Erro ao importar dados - arquivo inválido');
      }
    };
    reader.readAsText(file);
  }, [saveData]);

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('gastosData');
      setGastosData({});
      setAiAnalysis(null);
    }
  }, []);

  // Forçar re-análise da IA
  const refreshAI = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const analysis = analyzeWithAI(gastosData);
      setAiAnalysis(analysis);
      setLoading(false);
    }, 1000);
  }, [gastosData]);

  return {
    gastosData,
    aiAnalysis,
    loading,
    error,
    addGasto,
    removeGasto,
    exportData,
    importData,
    clearAllData,
    refreshAI,
    setError
  };
};
