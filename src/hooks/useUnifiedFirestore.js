import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useUnifiedFirestore = () => {
  const [userId, setUserId] = useState(null); // Log userId changes
  useEffect(() => {
    console.log('User ID:', userId);
  }, [userId]);
  const [gastosData, setGastosData] = useState({});
  const [gastosFixos, setGastosFixos] = useState({});
  const [rendimentosData, setRendimentosData] = useState({});
  const [diasTrabalhados, setDiasTrabalhados] = useState({});
  const [dividasData, setDividasData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Base paths
  const userFinancePath = userId ? `users/${userId}/financeiro/2025` : null;
  const mesesPath = userFinancePath ? `${userFinancePath}/meses` : null;

  // Listen for auth state changes
  useEffect(() => {
    console.log('Auth state listener initialized');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user); // Log user authentication
      console.log('User ID:', user ? user.uid : 'No user'); // Log user ID
      if (user) {
        setUserId(user.uid);
      console.log('User ID set:', user.uid); // Log to verify if userId is being set
      console.log('Current User:', auth.currentUser); // Log the current user object
      } else {
        setUserId(null);
        console.log('User ID set to null - user not authenticated');
      }
    });
    return () => {
      console.log('Auth state listener unsubscribed');
      unsubscribe();
    };
  }, []);

  // Load gastos fixos for a specific month
  const loadGastosFixos = useCallback(async (mesId) => {
    if (!mesesPath) return;
    try {
      const gastosFixosRef = collection(db, `${mesesPath}/${mesId}/gastosFixos`);
      const gastosFixosSnapshot = await getDocs(gastosFixosRef);
      console.log(`📊 Snapshot de gastos fixos para ${mesId}:`, gastosFixosSnapshot);
      
      if (gastosFixosSnapshot.empty) {
        console.warn(`⚠️ Nenhum gasto fixo encontrado para ${mesId}.`);
        // Initialize with empty object for this month
        setGastosFixos(prev => ({ ...prev, [mesId]: {} }));
        return;
      }

      const data = {};
      gastosFixosSnapshot.forEach(doc => {
        data[doc.id] = doc.data().valor; // Extract the valor field
      });
      
      // Update gastosFixos state with data for this specific month
      setGastosFixos(prev => ({ ...prev, [mesId]: data }));
    } catch (err) {
      console.warn(`⚠️ Erro ao carregar gastos fixos para ${mesId}:`, err);
    }
  }, [mesesPath]);

  // Load data for a specific month
  const loadMonthData = useCallback(async (mesId) => {
    if (!mesesPath) return;
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

      // Load gastos fixos for this month
      await loadGastosFixos(mesId);

    } catch (err) {
      console.warn(`⚠️ Erro ao carregar dados de ${mesId}:`, err);
    }
  }, [mesesPath, loadGastosFixos]);

  // Load all data when userId changes
  useEffect(() => {
    if (userId === null) {
      // User explicitly logged out or not authenticated
      setLoading(false);
      setConnectionStatus('error');
      setError('Usuário não autenticado');
      return;
    }

    if (userId === undefined) {
      // Still initializing auth state, don't show error yet
      return;
    }

    const loadAllData = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        console.log('🔥 Carregando todos os dados do Firestore...');

        // Load data for each month (this will also load gastos fixos for each month)
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
  }, [userId, loadGastosFixos, loadMonthData]);


  // Add gasto variável
  const addGasto = useCallback(async (mesId, data, desc, valor) => {
    if (!mesesPath) return;
    try {
      const novoGasto = {
        data,
        desc: desc.trim(),
        valor: parseFloat(valor),
        timestamp: new Date().toISOString()
      };

      console.log('➕ Adicionando gasto ao Firestore:', novoGasto);

      const gastoId = `gasto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Fix the path construction to ensure even number of segments
      await setDoc(doc(db, `${mesesPath}/${mesId}/gastosVariaveis`, gastoId), novoGasto);

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
    if (!mesesPath) return;
    try {
      console.log('🗑️ Removendo gasto do Firestore:', gastoId);

      // Fix the path construction to ensure even number of segments
      await deleteDoc(doc(db, `${mesesPath}/${mesId}/gastosVariaveis`, gastoId));

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

  // Update gastos fixos for a specific month
  const updateGastosFixos = useCallback(async (mesId, novosGastosFixos) => {
    if (!mesesPath) return;
    try {
      console.log('💾 Atualizando gastos fixos no Firestore:', novosGastosFixos);

      // Save each gasto fixo as individual document under the specific month
      for (const [categoria, valor] of Object.entries(novosGastosFixos)) {
        const gastoPath = `${mesesPath}/${mesId}/gastosFixos/${categoria}`;
        await setDoc(doc(db, gastoPath), { valor });
      }

      // Update gastosFixos state for this specific month
      setGastosFixos(prev => ({ ...prev, [mesId]: novosGastosFixos }));
      console.log('✅ Gastos fixos atualizados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao atualizar gastos fixos:', err);
      setError('Erro ao salvar gastos fixos: ' + err.message);
    }
  }, [mesesPath]);

  // Update dias trabalhados
  const updateDiasTrabalhados = useCallback(async (mesId, novosDias) => {
    if (!mesesPath) return;
    try {
      console.log('💾 Atualizando dias trabalhados no Firestore:', novosDias);

      // Create a document for diasTrabalhados within the month's collection
      // Using collection and doc correctly to ensure even number of segments
      await setDoc(doc(db, `${mesesPath}/${mesId}/diasTrabalhados`, 'data'), novosDias);

      setDiasTrabalhados(prev => ({ ...prev, [mesId]: novosDias }));
      console.log('✅ Dias trabalhados atualizados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao atualizar dias trabalhados:', err);
      setError('Erro ao salvar dias trabalhados: ' + err.message);
    }
  }, [mesesPath]);

  // Add rendimento extra
  const addRendimentoExtra = useCallback(async (mesId, rendimento) => {
    if (!mesesPath) return;
    try {
      console.log('➕ Adicionando rendimento extra ao Firestore:', rendimento);

      const rendimentoId = `rendimento_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Fix the path construction to ensure even number of segments
      await setDoc(doc(db, `${mesesPath}/${mesId}/rendimentosExtras`, rendimentoId), {
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
    if (!mesesPath) return;
    try {
      console.log('🗑️ Removendo rendimento extra do Firestore:', rendimentoId);

      // Fix the path construction to ensure even number of segments
      await deleteDoc(doc(db, `${mesesPath}/${mesId}/rendimentosExtras`, rendimentoId));

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
    if (!mesesPath) return;
    try {
      console.log('➕ Adicionando dívida ao Firestore:', divida);

      const dividaId = `divida_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Fix the path construction to ensure even number of segments
      await setDoc(doc(db, `${mesesPath}/${mesId}/dividas`, dividaId), {
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
    if (!mesesPath) return;
    try {
      console.log('🗑️ Removendo dívida do Firestore:', dividaId);

      // Fix the path construction to ensure even number of segments
      await deleteDoc(doc(db, `${mesesPath}/${mesId}/dividas`, dividaId));

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
    if (!mesesPath) return;
    try {
      console.log('🔄 Atualizando status da dívida:', dividaId, novoStatus);

      // Fix the path construction to ensure even number of segments
      await updateDoc(doc(db, `${mesesPath}/${mesId}/dividas`, dividaId), { status: novoStatus });

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
    userId, // Expose userId for authentication checks
    
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
