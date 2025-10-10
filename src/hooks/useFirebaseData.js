// src/hooks/useFirebaseData.js
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  
} from 'firebase/firestore';
import { db } from '../firebase.js';

export const useFirebaseData = () => {
  const [gastosData, setGastosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados do Firebase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔥 Carregando dados do Firebase...');

        // Carregar todos os meses
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const allData = {};

        for (const mes of meses) {
          try {
            const gastosRef = collection(db, 'gastos', '2025', mes);
            const gastosSnapshot = await getDocs(gastosRef);
            
            const gastosArray = [];
            gastosSnapshot.forEach((doc) => {
              gastosArray.push({
                id: doc.id,
                ...doc.data()
              });
            });

            if (gastosArray.length > 0) {
              // Ordenar por data
              gastosArray.sort((a, b) => new Date(a.data) - new Date(b.data));
              allData[mes] = gastosArray;
              console.log(`📅 ${mes}: ${gastosArray.length} gastos carregados`);
            }
          } catch (monthError) {
            console.warn(`⚠️ Erro ao carregar ${mes}:`, monthError);
          }
        }

        console.log('✅ Dados carregados do Firebase:', allData);
        setGastosData(allData);

      } catch (err) {
        console.error('❌ Erro ao carregar dados do Firebase:', err);
        setError('Erro ao conectar com Firebase: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Adicionar gasto no Firebase
  const addGasto = useCallback(async (mesId, data, desc, valor) => {
    try {
      const novoGasto = {
        data,
        desc: desc.trim(),
        valor: parseFloat(valor),
        timestamp: new Date().toISOString()
      };

      console.log('➕ Adicionando gasto ao Firebase:', novoGasto);

      // Gerar ID único
      const gastoId = `gasto_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      // Salvar no Firebase
      await setDoc(doc(db, 'gastos', '2025', mesId, gastoId), novoGasto);

      // Atualizar estado local
      setGastosData(prev => ({
        ...prev,
        [mesId]: [...(prev[mesId] || []), { id: gastoId, ...novoGasto }]
      }));

      console.log('✅ Gasto adicionado com sucesso');

    } catch (err) {
      console.error('❌ Erro ao adicionar gasto:', err);
      setError('Erro ao salvar gasto: ' + err.message);
    }
  }, []);

  // Remover gasto do Firebase
  const removeGasto = useCallback(async (mesId, index) => {
    try {
      const gastoToRemove = gastosData[mesId][index];
      
      if (!gastoToRemove || !gastoToRemove.id) {
        throw new Error('Gasto não encontrado ou sem ID');
      }

      console.log('🗑️ Removendo gasto do Firebase:', gastoToRemove);

      // Remover do Firebase
      await deleteDoc(doc(db, 'gastos', '2025', mesId, gastoToRemove.id));

      // Atualizar estado local
      setGastosData(prev => ({
        ...prev,
        [mesId]: prev[mesId].filter((_, i) => i !== index)
      }));

      console.log('✅ Gasto removido com sucesso');

    } catch (err) {
      console.error('❌ Erro ao remover gasto:', err);
      setError('Erro ao remover gasto: ' + err.message);
    }
  }, [gastosData]);

  // Exportar dados
  const exportData = useCallback(() => {
    const dataToExport = {
      gastosData,
      exportDate: new Date().toISOString(),
      source: 'firebase',
      version: '2.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-financeiro-firebase-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [gastosData]);

  // Importar dados para Firebase
  const importData = useCallback(async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setLoading(true);
        const importedData = JSON.parse(e.target.result);
        
        const dataToImport = importedData.gastosData || importedData;
        console.log('📥 Importando dados para Firebase:', dataToImport);

        // Importar cada mês
        for (const [mes, gastos] of Object.entries(dataToImport)) {
          if (Array.isArray(gastos)) {
            for (const gasto of gastos) {
              const gastoId = gasto.id || `imported_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
              const gastoData = {
                data: gasto.data,
                desc: gasto.desc,
                valor: gasto.valor,
                timestamp: gasto.timestamp || new Date().toISOString()
              };

              await setDoc(doc(db, 'gastos', '2025', mes, gastoId), gastoData);
            }
          }
        }

        // Recarregar dados
        window.location.reload();

      } catch (err) {
        console.error('❌ Erro ao importar dados:', err);
        setError('Erro ao importar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  }, []);

  // Limpar todos os dados do Firebase
  const clearAllData = useCallback(async () => {
    if (window.confirm('⚠️ ATENÇÃO: Isso irá deletar TODOS os dados do Firebase permanentemente. Tem certeza?')) {
      try {
        setLoading(true);
        console.log('🗑️ Limpando todos os dados do Firebase...');

        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

        for (const mes of meses) {
          const gastosRef = collection(db, 'gastos', '2025', mes);
          const snapshot = await getDocs(gastosRef);
          
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        }

        setGastosData({});
        console.log('✅ Todos os dados foram removidos do Firebase');

      } catch (err) {
        console.error('❌ Erro ao limpar dados:', err);
        setError('Erro ao limpar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  // Forçar recarregamento
  const refreshData = useCallback(() => {
    window.location.reload();
  }, []);

  return {
    gastosData,
    loading,
    error,
    addGasto,
    removeGasto,
    exportData,
    importData,
    clearAllData,
    refreshData,
    setError
  };
};
