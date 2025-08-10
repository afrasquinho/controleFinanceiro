// src/hooks/useFinanceData.js
import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const useFinanceData = () => {
  const [gastosData, setGastosData] = useState({
    jan: [{data: '05/01', desc: 'Combustível', valor: 60.00}, {data: '10/01', desc: 'Supermercado', valor: 120.00}],
    fev: [], mar: [], abr: [], mai: [], jun: [], jul: [], ago: [], set: [], out: [], nov: [], dez: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Salvar dados no Firebase
  const saveData = useCallback(async (data) => {
    try {
      await setDoc(doc(db, 'financeiro', 'gastos2025'), {
        gastos: data,
        lastUpdate: new Date().toISOString()
      });
      console.log('Dados salvos no Firebase');
    } catch (err) {
      setError('Erro ao salvar dados: ' + err.message);
      console.error('Erro ao salvar dados:', err);
    }
  }, []);

  // Carregar dados do Firebase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, 'financeiro', 'gastos2025');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGastosData(data.gastos || {
          jan: [{data: '05/01', desc: 'Combustível', valor: 60.00}, {data: '10/01', desc: 'Supermercado', valor: 120.00}],
          fev: [], mar: [], abr: [], mai: [], jun: [], jul: [], ago: [], set: [], out: [], nov: [], dez: []
        });
      }
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Adicionar gasto
  const addGasto = useCallback((mes, data, desc, valor) => {
    const dateObj = new Date(data);
    const dataFormatada = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    const novoGasto = {
      data: dataFormatada,
      desc: desc,
      valor: parseFloat(valor),
      timestamp: new Date().toISOString()
    };

    setGastosData(prevData => {
      const newData = {
        ...prevData,
        [mes]: [...prevData[mes], novoGasto]
      };
      
      // Salvar automaticamente
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  // Remover gasto
  const removeGasto = useCallback((mes, index) => {
    if (window.confirm('Tem a certeza que deseja remover este gasto?')) {
      setGastosData(prevData => {
        const newData = {
          ...prevData,
          [mes]: prevData[mes].filter((_, i) => i !== index)
        };
        
        // Salvar automaticamente
        saveData(newData);
        return newData;
      });
    }
  }, [saveData]);

  // Exportar dados
  const exportData = useCallback(() => {
    setGastosData(currentData => {
      const dataToExport = {
        gastosData: currentData,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `controle_financeiro_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return currentData; // Retorna os dados sem modificar
    });
  }, []);

  // Importar dados
  const importData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.gastosData) {
          if (window.confirm('Isto irá substituir todos os dados atuais. Tem a certeza?')) {
            setGastosData(importedData.gastosData);
            saveData(importedData.gastosData);
            alert('Dados importados com sucesso!');
          }
        } else {
          alert('Arquivo inválido. Por favor, selecione um arquivo de backup válido.');
        }
      } catch (error) {
        alert('Erro ao importar dados. Verifique se o arquivo está correto.');
      }
    };
    reader.readAsText(file);
  }, [saveData]);

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    if (window.confirm('⚠️ ATENÇÃO: Isto irá apagar TODOS os dados permanentemente!\n\nTem ABSOLUTA certeza?')) {
      if (window.confirm('Última confirmação: Esta ação é irreversível. Continuar?')) {
        const emptyData = {
          jan: [], fev: [], mar: [], abr: [], mai: [], jun: [], 
          jul: [], ago: [], set: [], out: [], nov: [], dez: []
        };
        setGastosData(emptyData);
        saveData(emptyData);
        alert('Todos os dados foram removidos!');
      }
    }
  }, [saveData]);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    gastosData,
    loading,
    error,
    addGasto,
    removeGasto,
    exportData,
    importData,
    clearAllData,
    refreshData: loadData
  };
};
