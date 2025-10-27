import { useState, useEffect, useCallback } from 'react';
import apiClient from '../config/api.js';

// Hook para gerenciar dados do MongoDB
export const useMongoDB = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar se usuário está logado
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMe();
      setUser(response.data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await apiClient.login({ email, password });
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registro
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Google Login
  const googleLogin = useCallback(async (credential) => {
    try {
      setLoading(true);
      const response = await apiClient.googleLogin({ tokenId: credential });
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar autenticação na inicialização
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    googleLogin,
    checkAuth
  };
};

// Hook para gerenciar gastos
export const useGastos = (mes, ano) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      
      const response = await apiClient.getGastos(params);
      setGastos(response.data.gastos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const addGasto = useCallback(async (gastoData) => {
    try {
      setLoading(true);
      const response = await apiClient.createGasto(gastoData);
      setGastos(prev => [response.data.gasto, ...prev]);
      return response.data.gasto;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGasto = useCallback(async (id, gastoData) => {
    try {
      setLoading(true);
      const response = await apiClient.updateGasto(id, gastoData);
      setGastos(prev => prev.map(g => g._id === id ? response.data.gasto : g));
      return response.data.gasto;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGasto = useCallback(async (id) => {
    try {
      setLoading(true);
      await apiClient.deleteGasto(id);
      setGastos(prev => prev.filter(g => g._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGastos();
  }, [fetchGastos]);

  return {
    gastos,
    loading,
    error,
    addGasto,
    updateGasto,
    deleteGasto,
    refetch: fetchGastos
  };
};

// Hook para gerenciar rendimentos
export const useRendimentos = (mes, ano) => {
  const [rendimentos, setRendimentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRendimentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      
      const response = await apiClient.getRendimentos(params);
      setRendimentos(response.data.rendimentos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const addRendimento = useCallback(async (rendimentoData) => {
    try {
      setLoading(true);
      const response = await apiClient.createRendimento(rendimentoData);
      setRendimentos(prev => [response.data.rendimento, ...prev]);
      return response.data.rendimento;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRendimento = useCallback(async (id, rendimentoData) => {
    try {
      setLoading(true);
      const response = await apiClient.updateRendimento(id, rendimentoData);
      setRendimentos(prev => prev.map(r => r._id === id ? response.data.rendimento : r));
      return response.data.rendimento;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRendimento = useCallback(async (id) => {
    try {
      setLoading(true);
      await apiClient.deleteRendimento(id);
      setRendimentos(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRendimentos();
  }, [fetchRendimentos]);

  return {
    rendimentos,
    loading,
    error,
    addRendimento,
    updateRendimento,
    deleteRendimento,
    refetch: fetchRendimentos
  };
};

// Hook para analytics/dashboard
export const useAnalytics = (mes, ano) => {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState(null);
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      
      const response = await apiClient.getDashboard(params);
      setDashboard(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getTrends();
      setTrends(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (mes) params.mes = mes;
      if (ano) params.ano = ano;
      
      const response = await apiClient.getCategories(params);
      setCategories(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  useEffect(() => {
    fetchDashboard();
    fetchTrends();
    fetchCategories();
  }, [fetchDashboard, fetchTrends, fetchCategories]);

  return {
    dashboard,
    trends,
    categories,
    loading,
    error,
    refetch: {
      dashboard: fetchDashboard,
      trends: fetchTrends,
      categories: fetchCategories
    }
  };
};
