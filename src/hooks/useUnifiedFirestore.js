// src/hooks/useUnifiedFirestore.js
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// Default user ID (can be extended for multi-user support)
const USER_ID = 'default-user';

export const useUnifiedFirestore = () => {
  const [gastosData, setGastosData] = useState({});
  const [gastosFixos, setGastosFixos] = useState({});
  const [rendimentosData, setRendimentosData] = useState({});
  const [diasTrabalhados, setDiasTrabalhados] = useState({});
  const [dividasData, setDividasData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Base paths
  const userFinancePath = `users/${USER_ID}/financeiro/2025`;
  const gastosFixosPath = `${userFinancePath}/gastosFixos`;
  const mesesPath = `${userFinancePath}/meses`;

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        console.log('🔥 Carregando todos os dados do Firestore...');

        // Load gastos fixos
        await loadGastosFixos();
        
        // Load data for each month
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        
        for (const mes of meses) {
          await loadMonthData(mes);
        }

        setConnectionStatus('connected');
        console.log('✅ Todos os dados carregados do Firestore');

      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        setError('Erro ao conectar com Firebase: ' + err.message);
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Load gastos fixos
  const loadGastosFixos = async () => {
    try {
      const gastosFixosDoc = doc(db, gastosFixosPath);
      const gastosFixosSnapshot = await getDocs(collection(db, gastosFixosPath));
      
      if (!gastosFixosSnapshot.empty) {
        const data = {};
        gastosFixosSnapshot.forEach(doc => {
          data[doc.id] = doc.data();
        });
        setGastosFixos(data);
      }
    } catch (err) {
      console.warn('⚠️ Erro ao carregar gastos fixos:', err);
    }
  };

  // Load data for a specific month
  const loadMonthData = async (mesId) => {
    try {
      const mesPath = `${mesesPath}/${mesId}`;
      
      // Load gastos variáveis
      const gastosRef = collection(db, mesPath, 'gastosVariaveis');
      const gastosSnapshot = await getDocs(gastosRef);
      
      const gastosArray = [];
      gastosSnapshot.forEach(doc => {
        gastosArray.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (gastosArray.length > 0) {
        gastosArray.sort((a, b) => new Date(a.data) - new Date(b.data));
        setGastosData(prev => ({ ...prev, [mesId]: gastosArray }));
      }

      // Load rendimentos extras
      const rendimentosRef = collection(db, mesPath, 'rendimentosExtras');
      const rendimentosSnapshot = await getDocs(rendimentosRef);
      
      const rendimentosArray = [];
      rendimentosSnapshot.forEach(doc => {
        rendimentosArray.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (rendimentosArray.length > 0) {
        setRendimentosData(prev => ({ ...prev, [mesId]: rendimentosArray }));
      }

      // Load dias trabalhados
      const diasDoc = doc(db, mesPath, 'diasTrabalhados');
      try {
        const diasSnapshot = await getDocs(collection(db, mesPath, 'diasTrabalhados'));
        if (!diasSnapshot.empty) {
          const diasData = {};
          diasSnapshot.forEach(doc => {
            diasData[doc.id] = doc.data();
          });
          setDiasTrabalhados(prev => ({ ...prev, [mesId]: diasData }));
        }
      } catch (err) {
        console.warn(`⚠️ Dias trabalhados não encontrados para ${mesId}:`, err);
      }

      // Load dívidas
      const dividasRef = collection(db, mesPath, 'dividas');
      const dividasSnapshot = await getDocs(dividasRef);
      
      const dividasArray = [];
      dividasSnapshot.forEach(doc => {
        dividasArray.push({
          id: doc.id,
          ...doc.data()
        });
      });

      if (dividasArray.length > 0) {
        setDividasData(prev => ({ ...prev, [mesId]: dividasArray }));
      }

    } catch (err) {
      console.warn(`⚠️ Erro ao carregar dados de ${mesId}:`, err);
    }
  };

  // Add gasto variável
  const addGasto = useCallback(async (mesId, data, desc, valor) => {
    try {
      const novoGasto = {
        data,
        desc: desc.trim(),
        valor: parseFloat(valor),
        timestamp: new Date().toISOString()
      };

      console.log('➕ Adicionando gasto ao Firestore:', novoGasto);

      const gastoId = `gasto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const gastoPath = `${mesesPath}/${mesId}/gastosVariaveis/${gastoId}`;
      
      await setDoc(doc(db, gastoPath), novoGasto);

      // Update local state
      setGastosData(prev => ({
        ...prev,
        [mesId]: [...(prev[mesId] || []), { id: gastoId, ...novoGasto }]
      }));

      console.log('✅ Gasto adicionado com sucesso');

    } catch (err) {
      console.error('❌ Erro ao adicionar gasto:', err);
      setError('Erro ao salvar gasto: ' + err.message);
    }
  }, [mesesPath]);

  // Remove gasto variável
  const removeGasto = useCallback(async (mesId, gastoId) => {
    try {
      console.log('🗑️ Removendo gasto do Firestore:', gastoId);

      const gastoPath = `${mesesPath}/${mesId}/gastosVariaveis/${gastoId}`;
      await deleteDoc(doc(db, gastoPath));

      // Update local state
      setGastosData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).filter(gasto => gasto.id !== gastoId)
      }));

      console.log('✅ Gasto removido com sucesso');

    } catch (err) {
      console.error('❌ Erro ao remover gasto:', err);
      setError('Erro ao remover gasto: ' + err.message);
    }
  }, [mesesPath]);

  // Update gastos fixos
  const updateGastosFixos = useCallback(async (novosGastosFixos) => {
    try {
      console.log('💾 Atualizando gastos fixos no Firestore:', novosGastosFixos);

      // Save each gasto fixo as individual document
      for (const [categoria, valor] of Object.entries(novosGastosFixos)) {
        const gastoPath = `${gastosFixosPath}/${categoria}`;
        await setDoc(doc(db, gastoPath), { valor });
      }

      setGastosFixos(novosGastosFixos);
      console.log('✅ Gastos fixos atualizados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao atualizar gastos fixos:', err);
      setError('Erro ao salvar gastos fixos: ' + err.message);
    }
  }, [gastosFixosPath]);

  // Update dias trabalhados
  const updateDiasTrabalhados = useCallback(async (mesId, novosDias) => {
    try {
      console.log('💾 Atualizando dias trabalhados no Firestore:', novosDias);

      const diasPath = `${mesesPath}/${mesId}/diasTrabalhados`;
      await setDoc(doc(db, diasPath), novosDias);

      setDiasTrabalhados(prev => ({ ...prev, [mesId]: novosDias }));
      console.log('✅ Dias trabalhados atualizados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao atualizar dias trabalhados:', err);
      setError('Erro ao salvar dias trabalhados: ' + err.message);
    }
  }, [mesesPath]);

  // Add rendimento extra
  const addRendimentoExtra = useCallback(async (mesId, rendimento) => {
    try {
      console.log('➕ Adicionando rendimento extra ao Firestore:', rendimento);

      const rendimentoId = `rendimento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const rendimentoPath = `${mesesPath}/${mesId}/rendimentosExtras/${rendimentoId}`;
      
      await setDoc(doc(db, rendimentoPath), {
        ...rendimento,
        timestamp: new Date().toISOString()
      });

      // Update local state
      setRendimentosData(prev => ({
        ...prev,
        [mesId]: [...(prev[mesId] || []), { id: rendimentoId, ...rendimento }]
      }));

      console.log('✅ Rendimento extra adicionado com sucesso');

    } catch (err) {
      console.error('❌ Erro ao adicionar rendimento extra:', err);
      setError('Erro ao salvar rendimento extra: ' + err.message);
    }
  }, [mesesPath]);

  // Remove rendimento extra
  const removeRendimentoExtra = useCallback(async (mesId, rendimentoId) => {
    try {
      console.log('🗑️ Removendo rendimento extra do Firestore:', rendimentoId);

      const rendimentoPath = `${mesesPath}/${mesId}/rendimentosExtras/${rendimentoId}`;
      await deleteDoc(doc(db, rendimentoPath));

      // Update local state
      setRendimentosData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).filter(rendimento => rendimento.id !== rendimentoId)
      }));

      console.log('✅ Rendimento extra removido com sucesso');

    } catch (err) {
      console.error('❌ Erro ao remover rendimento extra:', err);
      setError('Erro ao remover rendimento extra: ' + err.message);
    }
  }, [mesesPath]);

  // Add dívida
  const addDivida = useCallback(async (mesId, divida) => {
    try {
      console.log('➕ Adicionando dívida ao Firestore:', divida);

      const dividaId = `divida_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dividaPath = `${mesesPath}/${mesId}/dividas/${dividaId}`;
      
      await setDoc(doc(db, dividaPath), {
        ...divida,
        timestamp: new Date().toISOString()
      });

      // Update local state
      setDividasData(prev => ({
        ...prev,
        [mesId]: [...(prev[mesId] || []), { id: dividaId, ...divida }]
      }));

      console.log('✅ Dívida adicionada com sucesso');

    } catch (err) {
      console.error('❌ Erro ao adicionar dívida:', err);
      setError('Erro ao salvar dívida: ' + err.message);
    }
  }, [mesesPath]);

  // Remove dívida
  const removeDivida = useCallback(async (mesId, dividaId) => {
    try {
      console.log('🗑️ Removendo dívida do Firestore:', dividaId);

      const dividaPath = `${mesesPath}/${mesId}/dividas/${dividaId}`;
      await deleteDoc(doc(db, dividaPath));

      // Update local state
      setDividasData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).filter(divida => divida.id !== dividaId)
      }));

      console.log('✅ Dívida removida com sucesso');

    } catch (err) {
      console.error('❌ Erro ao remover dívida:', err);
      setError('Erro ao remover dívida: ' + err.message);
    }
  }, [mesesPath]);

  // Update dívida status
  const updateDividaStatus = useCallback(async (mesId, dividaId, novoStatus) => {
    try {
      console.log('🔄 Atualizando status da dívida:', dividaId, novoStatus);

      const dividaPath = `${mesesPath}/${mesId}/dividas/${dividaId}`;
      await updateDoc(doc(db, dividaPath), { status: novoStatus });

      // Update local state
      setDividasData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).map(divida => 
          divida.id === dividaId ? { ...divida, status: novoStatus } : divida
        )
      }));

      console.log('✅ Status da dívida atualizado com sucesso');

    } catch (err) {
      console.error('❌ Erro ao atualizar status da dívida:', err);
      setError('Erro ao atualizar dívida: ' + err.message);
    }
  }, [mesesPath]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reload data
  const reloadData = useCallback(async () => {
    setLoading(true);
    setGastosData({});
    setGastosFixos({});
    setRendimentosData({});
    setDiasTrabalhados({});
    setDividasData({});
    
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  // Calculate total transactions
  const totalTransactions = Object.values(gastosData).reduce((total, gastos) => 
    total + (Array.isArray(gastos) ? gastos.length : 0), 0
  );

  return {
    // Data
    gastosData,
    gastosFixos,
    rendimentosData,
    diasTrabalhados,
    dividasData,
    
    // State
    loading,
    error,
    connectionStatus,
    totalTransactions,
    
    // Actions
    addGasto,
    removeGasto,
    updateGastosFixos,
    updateDiasTrabalhados,
    addRendimentoExtra,
    removeRendimentoExtra,
    addDivida,
    removeDivida,
    updateDividaStatus,
    
    // Utilities
    clearError,
    reloadData
  };
};
