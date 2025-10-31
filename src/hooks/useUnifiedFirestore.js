import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { mesesInfo } from '../data/monthsData.js';
import apiClient from '../config/api.js';

/**
 * Custom hook for managing financial data with Firestore
 *
 * Provides comprehensive CRUD operations for expenses, fixed costs, income,
 * working days, and debts. Handles authentication state and data synchronization.
 *
 * @returns {Object} Hook state and methods
 * @property {Object} gastosData - Variable expenses data by month
 * @property {Object} gastosFixos - Fixed expenses data by month
 * @property {Object} rendimentosData - Income data by month
 * @property {Object} diasTrabalhados - Working days data by month
 * @property {Object} dividasData - Debts data by month
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {string} connectionStatus - Connection status ('connecting'|'connected'|'error')
 * @property {number} totalTransactions - Total number of transactions
 * @property {string|null} userId - Current authenticated user ID
 * @property {Function} addGasto - Add variable expense
 * @property {Function} removeGasto - Remove variable expense
 * @property {Function} updateGastosFixos - Update fixed expenses
 * @property {Function} updateDiasTrabalhados - Update working days
 * @property {Function} addRendimentoExtra - Add extra income
 * @property {Function} removeRendimentoExtra - Remove extra income
 * @property {Function} addDivida - Add debt
 * @property {Function} removeDivida - Remove debt
 * @property {Function} updateDividaStatus - Update debt status
 * @property {Function} clearError - Clear error state
 * @property {Function} reloadData - Reload all data
 */
export const useUnifiedFirestore = () => {
  const dataSource = process.env.REACT_APP_DATA_SOURCE || 'mongodb';
  // undefined represents "initializing auth"; null represents "logged out"; string is the authenticated user id
  const [userId, setUserId] = useState(undefined);
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

  // Use real authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load gastos fixos for a specific month
  const loadGastosFixos = useCallback(async (mesId) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      if (dataSource === 'mongodb') {
        const resp = await apiClient.getFixedCosts({ mesId: mesId, ano: 2025 });
        const mongoCosts = resp && resp.costs ? resp.costs : [];
        if (mongoCosts.length > 0) {
          const data = {};
          mongoCosts.forEach(item => { data[item.categoria] = item.valor; });
          setGastosFixos(prev => ({ ...prev, [mesId]: data }));
          return;
        }
      }
      // Fallback Firestore (dados ainda não migrados)
      if (mesesPath) {
        const gastosFixosRef = collection(db, `${mesesPath}/${mesId}/gastosFixos`);
        const gastosFixosSnapshot = await getDocs(gastosFixosRef);
        const data = {};
        gastosFixosSnapshot.forEach(doc => { data[doc.id] = doc.data().valor; });
        setGastosFixos(prev => ({ ...prev, [mesId]: data }));
      } else {
        setGastosFixos(prev => ({ ...prev, [mesId]: {} }));
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Erro ao carregar gastos fixos para ${mesId}:`, err);
      }
    }
  }, [mesesPath, dataSource]);

  // Load data for a specific month
  const loadMonthData = useCallback(async (mesId) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      const mesPath = `${mesesPath}/${mesId}`;
      
      // Load gastos variáveis
      if (dataSource === 'mongodb') {
        const resp = await apiClient.getGastos({ mes: mesId, ano: 2025, page: 1, limit: 1000 });
        const apiGastos = (resp?.data?.gastos) || (resp?.gastos) || [];
        if (apiGastos.length > 0) {
          const gastosArray = apiGastos.map(g => ({
            id: g._id,
            data: g.data || new Date().toISOString().slice(0,10),
            desc: g.descricao,
            valor: g.valor,
            categoria: g.categoria,
            tag: (g.tags && g.tags[0]) || ''
          }));
          gastosArray.sort((a, b) => new Date(a.data) - new Date(b.data));
          setGastosData(prev => ({ ...prev, [mesId]: gastosArray }));
        } else if (mesesPath) {
          const gastosRef = collection(db, `${mesesPath}/${mesId}/gastosVariaveis`);
          const gastosSnapshot = await getDocs(gastosRef);
          const gastosArray = [];
          gastosSnapshot.forEach(doc => {
            gastosArray.push({ id: doc.id, ...doc.data() });
          });
          if (gastosArray.length > 0) {
            gastosArray.sort((a, b) => new Date(a.data) - new Date(b.data));
            setGastosData(prev => ({ ...prev, [mesId]: gastosArray }));
          }
        }
      } else {
        const gastosRef = collection(db, mesPath, 'gastosVariaveis');
        const gastosSnapshot = await getDocs(gastosRef);
        const gastosArray = [];
        gastosSnapshot.forEach(doc => {
          gastosArray.push({ id: doc.id, ...doc.data() });
        });
        if (gastosArray.length > 0) {
          gastosArray.sort((a, b) => new Date(a.data) - new Date(b.data));
          setGastosData(prev => ({ ...prev, [mesId]: gastosArray }));
        }
      }

      // Load rendimentos extras
      if (dataSource === 'mongodb') {
        const respR = await apiClient.getRendimentos({ mes: mesId, ano: 2025, page: 1, limit: 1000 });
        const apiRend = (respR?.data?.rendimentos) || (respR?.rendimentos) || [];
        if (apiRend.length > 0) {
          const rendimentosArray = apiRend.map(r => ({
            id: r._id,
            fonte: r.fonte,
            valor: r.valor,
            descricao: r.descricao || ''
          }));
          setRendimentosData(prev => ({ ...prev, [mesId]: rendimentosArray }));
        } else if (mesesPath) {
          const rendimentosRef = collection(db, `${mesesPath}/${mesId}/rendimentosExtras`);
          const rendimentosSnapshot = await getDocs(rendimentosRef);
          const rendimentosArray = [];
          rendimentosSnapshot.forEach(doc => {
            rendimentosArray.push({ id: doc.id, ...doc.data() });
          });
          if (rendimentosArray.length > 0) {
            setRendimentosData(prev => ({ ...prev, [mesId]: rendimentosArray }));
          }
        }
      } else {
        const rendimentosRef = collection(db, mesPath, 'rendimentosExtras');
        const rendimentosSnapshot = await getDocs(rendimentosRef);
        const rendimentosArray = [];
        rendimentosSnapshot.forEach(doc => {
          rendimentosArray.push({ id: doc.id, ...doc.data() });
        });
        if (rendimentosArray.length > 0) {
          setRendimentosData(prev => ({ ...prev, [mesId]: rendimentosArray }));
        }
      }

      // Load dias trabalhados
      try {
        if (dataSource === 'mongodb') {
          const resp = await apiClient.getDaysWorked({ mes: mesId, ano: 2025 });
          const first = (resp.days && resp.days[0]) || null;
          if (first) setDiasTrabalhados(prev => ({ ...prev, [mesId]: { andre: first.andre, aline: first.aline } }));
        } else {
          const diasSnapshot = await getDocs(collection(db, mesPath, 'diasTrabalhados'));
          if (!diasSnapshot.empty) {
            let plano = null;
            diasSnapshot.forEach(docSnap => {
              if (!plano) plano = docSnap.data();
            });
            if (plano) {
              setDiasTrabalhados(prev => ({ ...prev, [mesId]: plano }));
            }
          }
        }
      } catch (err) {
        // Log error silently in production
        if (process.env.NODE_ENV === 'development') {
          console.warn(`⚠️ Dias trabalhados não encontrados para ${mesId}:`, err);
        }
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
      // Log error silently in production
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Erro ao carregar dados de ${mesId}:`, err);
      }
    }
  }, [mesesPath, loadGastosFixos, dataSource]);

  // Load all data when userId changes
  useEffect(() => {
    if (userId === null) {
      // User explicitly logged out or not authenticated
      setLoading(false);
      setConnectionStatus('error');
      setError(null); // Não mostrar erro quando não há usuário autenticado
      return;
    }

    if (userId === undefined) {
      // Still initializing auth state
      // Mantém o loading como true enquanto verifica
      return;
    }

    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null); // Limpar erros anteriores
        setConnectionStatus('connecting');
      // Load data for each month (this will also load gastos fixos for each month)
      for (const mes of mesesInfo) {
        await loadMonthData(mes.id);
      }

      setConnectionStatus('connected');
    } catch (err) {
      setError('Erro ao conectar com Firebase: ' + err.message);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Intentionally ignore the returned promise; effect is fire-and-forget
  void loadAllData();
}, [userId, loadGastosFixos, loadMonthData]);


  // Add gasto variável
  const addGasto = useCallback(async (mesId, data, desc, valor) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      if (dataSource === 'mongodb') {
        const payload = { descricao: desc.trim(), valor: parseFloat(valor), data, categoria: 'outros', mesId, ano: 2025 };
        const resp = await apiClient.createGasto(payload);
        const created = resp.gasto || resp.data?.gasto || {};
        setGastosData(prev => ({
          ...prev,
          [mesId]: [...(prev[mesId] || []), { id: created._id, data: created.data, desc: created.descricao, valor: created.valor, categoria: created.categoria }]
        }));
      } else {
        const novoGasto = { data, desc: desc.trim(), valor: parseFloat(valor), timestamp: new Date().toISOString() };
        const gastoId = `gasto_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        await setDoc(doc(db, `${mesesPath}/${mesId}/gastosVariaveis`, gastoId), novoGasto);
        setGastosData(prev => ({ ...prev, [mesId]: [...(prev[mesId] || []), { id: gastoId, ...novoGasto }] }));
      }

    } catch (err) {
      // Log error silently in production
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erro ao adicionar gasto:', err);
      }
      setError('Erro ao salvar gasto: ' + err.message);
    }
  }, [mesesPath, dataSource]);

  // Remove gasto variável
  const removeGasto = useCallback(async (mesId, gastoId) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      if (dataSource === 'mongodb') {
        await apiClient.deleteGasto(gastoId);
        setGastosData(prev => ({ ...prev, [mesId]: (prev[mesId] || []).filter(gasto => gasto.id !== gastoId) }));
      } else {
        await deleteDoc(doc(db, `${mesesPath}/${mesId}/gastosVariaveis`, gastoId));
        setGastosData(prev => ({ ...prev, [mesId]: (prev[mesId] || []).filter(gasto => gasto.id !== gastoId) }));
      }

    } catch (err) {
      console.error('❌ Erro ao remover gasto:', err);
      setError('Erro ao remover gasto: ' + err.message);
    }
  }, [mesesPath, dataSource]);

  // Update gastos fixos for a specific month
  const updateGastosFixos = useCallback(async (mesId, novosGastosFixos) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      // Save each gasto fixo as individual document under the specific month
      const gastosFixosCol = collection(db, `${mesesPath}/${mesId}/gastosFixos`);
      for (const [categoria, valor] of Object.entries(novosGastosFixos)) {
        await setDoc(doc(gastosFixosCol, categoria), { valor });
      }

      // Update gastosFixos state for this specific month
      setGastosFixos(prev => ({ ...prev, [mesId]: novosGastosFixos }));

    } catch (err) {
      console.error('❌ Erro ao atualizar gastos fixos:', err);
      setError('Erro ao salvar gastos fixos: ' + err.message);
    }
  }, [mesesPath, dataSource]);

  // Update dias trabalhados
  const updateDiasTrabalhados = useCallback(async (mesId, novosDias) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
        if (dataSource === 'mongodb') {
        try {
          await apiClient.upsertDaysWorked({ mesId, ano: 2025, ...novosDias });
          setDiasTrabalhados(prev => ({ ...prev, [mesId]: { ...novosDias } }));
          return;
        } catch (e) {
          if (process.env.NODE_ENV === 'development') console.warn('⚠️ MongoDB upsertDaysWorked falhou, usando Firestore:', e.message);
        }
      }
      await setDoc(doc(db, `${mesesPath}/${mesId}/diasTrabalhados`, 'data'), novosDias);
      setDiasTrabalhados(prev => ({ ...prev, [mesId]: { ...novosDias } }));

    } catch (err) {
      console.error('❌ Erro ao atualizar dias trabalhados:', err);
      setError('Erro ao salvar dias trabalhados: ' + err.message);
      throw err; // Re-throw the error so the calling component can handle it
    }
  }, [mesesPath, dataSource]);

  // Add rendimento extra
  const addRendimentoExtra = useCallback(async (mesId, rendimento) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      if (process.env.REACT_APP_DATA_SOURCE === 'mongodb') {
        const payload = { ...rendimento, mesId, ano: 2025 };
        const resp = await apiClient.createRendimento(payload);
        const created = resp.rendimento || resp.data?.rendimento || {};
        setRendimentosData(prev => ({ ...prev, [mesId]: [...(prev[mesId] || []), { id: created._id, fonte: created.fonte, valor: created.valor, descricao: created.descricao }] }));
      } else {
        const rendimentoId = `rendimento_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        await setDoc(doc(db, `${mesesPath}/${mesId}/rendimentosExtras`, rendimentoId), { ...rendimento, timestamp: new Date().toISOString() });
        setRendimentosData(prev => ({ ...prev, [mesId]: [...(prev[mesId] || []), { id: rendimentoId, ...rendimento }] }));
      }

    } catch (err) {
      console.error('❌ Erro ao adicionar rendimento extra:', err);
      setError('Erro ao salvar rendimento extra: ' + err.message);
    }
  }, [mesesPath, dataSource]);

  // Remove rendimento extra
  const removeRendimentoExtra = useCallback(async (mesId, rendimentoId) => {
    if (dataSource !== 'mongodb' && !mesesPath) return;
    try {
      if (process.env.REACT_APP_DATA_SOURCE === 'mongodb') {
        await apiClient.deleteRendimento(rendimentoId);
        setRendimentosData(prev => ({ ...prev, [mesId]: (prev[mesId] || []).filter(rendimento => rendimento.id !== rendimentoId) }));
      } else {
        await deleteDoc(doc(db, `${mesesPath}/${mesId}/rendimentosExtras`, rendimentoId));
        setRendimentosData(prev => ({ ...prev, [mesId]: (prev[mesId] || []).filter(rendimento => rendimento.id !== rendimentoId) }));
      }

    } catch (err) {
      console.error('❌ Erro ao remover rendimento extra:', err);
      setError('Erro ao remover rendimento extra: ' + err.message);
    }
  }, [mesesPath, dataSource]);

  // Add dívida
  const addDivida = useCallback(async (mesId, divida) => {
    if (!mesesPath) return;
    try {
      const dividaId = `divida_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
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

    } catch (err) {
      console.error('❌ Erro ao adicionar dívida:', err);
      setError('Erro ao salvar dívida: ' + err.message);
    }
  }, [mesesPath]);

  // Remove dívida
  const removeDivida = useCallback(async (mesId, dividaId) => {
    if (!mesesPath) return;
    try {
      // Fix the path construction to ensure even number of segments
      await deleteDoc(doc(db, `${mesesPath}/${mesId}/dividas`, dividaId));

      // Update local state
      setDividasData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).filter(divida => divida.id !== dividaId)
      }));

    } catch (err) {
      console.error('❌ Erro ao remover dívida:', err);
      setError('Erro ao remover dívida: ' + err.message);
    }
  }, [mesesPath]);

  // Update dívida status
  const updateDividaStatus = useCallback(async (mesId, dividaId, novoStatus) => {
    if (!mesesPath) return;
    try {
      // Fix the path construction to ensure even number of segments
      await updateDoc(doc(db, `${mesesPath}/${mesId}/dividas`, dividaId), { status: novoStatus });

      // Update local state
      setDividasData(prev => ({
        ...prev,
        [mesId]: (prev[mesId] || []).map(divida =>
          divida.id === dividaId ? { ...divida, status: novoStatus } : divida
        )
      }));

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

  // MIGRAÇÃO: enviar dados carregados para MongoDB
  const migrateToMongo = useCallback(async () => {
    try {
      // Migrar dias trabalhados e gastos fixos
      for (const mes of mesesInfo) {
        const mesId = mes.id;

        // Dias trabalhados
        const dias = diasTrabalhados[mesId];
        if (dias && (dias.andre != null || dias.aline != null)) {
          await apiClient.upsertDaysWorked({ mesId, ano: 2025, ...dias });
        }

        // Gastos fixos
        const fixosMes = gastosFixos[mesId] || {};
        for (const [categoria, valor] of Object.entries(fixosMes)) {
          if (typeof valor === 'number') {
            await apiClient.upsertFixedCost({ mesId, ano: 2025, categoria, valor });
          }
        }

        // Gastos variáveis
        const variaveis = gastosData[mesId] || [];
        for (const g of variaveis) {
          const dataStr = g.data || `2025-01-01`;
          await apiClient.createGasto({
            descricao: g.desc || 'Gasto',
            valor: Number(g.valor) || 0,
            categoria: g.categoria || 'outros',
            data: dataStr,
            tipo: 'variavel'
          });
        }
      }
      if (process.env.NODE_ENV === 'development') console.log('✅ Migração concluída');
    } catch (e) {
      console.error('❌ Erro na migração:', e);
      throw e;
    }
  }, [gastosData, gastosFixos, diasTrabalhados]);

  // Auto-migração: executa uma única vez após o primeiro carregamento
  const [autoMigrated, setAutoMigrated] = useState(false);
  useEffect(() => {
    if (dataSource === 'mongodb' && !autoMigrated && !loading) {
      migrateToMongo()
        .catch((e) => {
          if (process.env.NODE_ENV === 'development') console.warn('Migração automática falhou:', e.message);
        })
        .finally(() => setAutoMigrated(true));
    }
  }, [dataSource, autoMigrated, loading, migrateToMongo]);

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
    reloadData,
    migrateToMongo
  };
};
