import { useState, useEffect, useMemo, useCallback } from 'react';
import { analyzeWithAI } from '../utils/aiAdvanced.js';
import { useDebounce } from './useDebounce.js';

/**
 * Hook otimizado para análise com IA
 * Implementa debounce, memoização e cache para melhor performance
 * 
 * @param {Object} gastosData - Dados de gastos
 * @param {Object} rendimentosData - Dados de rendimentos (opcional)
 * @param {number} debounceDelay - Delay para debounce em ms (padrão: 500)
 * @returns {Object} Resultado da análise com loading e error states
 */
export const useAIAnalysis = (gastosData, rendimentosData = {}, debounceDelay = 500) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce dos dados para evitar chamadas excessivas da IA
  const debouncedGastosData = useDebounce(gastosData, debounceDelay);
  const debouncedRendimentosData = useDebounce(rendimentosData, debounceDelay);

  // Memoizar se há dados suficientes para análise
  const hasData = useMemo(() => {
    const totalTransactions = Object.values(debouncedGastosData).flat().length;
    return totalTransactions > 0;
  }, [debouncedGastosData]);

  // Memoizar chave de cache baseada nos dados
  const cacheKey = useMemo(() => {
    if (!hasData) return null;
    return JSON.stringify({
      gastos: debouncedGastosData,
      rendimentos: debouncedRendimentosData,
      timestamp: Math.floor(Date.now() / (1000 * 60)) // Cache por minuto
    });
  }, [debouncedGastosData, debouncedRendimentosData, hasData]);

  // Função para realizar análise com IA
  const performAnalysis = useCallback(async () => {
    if (!hasData || !cacheKey) {
      setAnalysis(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar cache local
      const cachedResult = localStorage.getItem(`ai_analysis_${cacheKey}`);
      if (cachedResult) {
        const parsedCache = JSON.parse(cachedResult);
        setAnalysis(parsedCache);
        setLoading(false);
        return;
      }

      // Realizar nova análise
      const result = analyzeWithAI(debouncedGastosData, debouncedRendimentosData);
      
      if (result) {
        setAnalysis(result);
        
        // Cache do resultado por 5 minutos
        localStorage.setItem(`ai_analysis_${cacheKey}`, JSON.stringify(result));
      } else {
        throw new Error('Análise IA retornou resultado inválido');
      }

    } catch (err) {
      setError(err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro na análise IA:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [hasData, cacheKey, debouncedGastosData, debouncedRendimentosData]);

  // Executar análise quando dados mudarem
  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  // Função para forçar nova análise (limpar cache)
  const refreshAnalysis = useCallback(() => {
    if (cacheKey) {
      localStorage.removeItem(`ai_analysis_${cacheKey}`);
      performAnalysis();
    }
  }, [cacheKey, performAnalysis]);

  // Função para limpar cache antigo
  const clearOldCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    const oldKeys = keys.filter(key => 
      key.startsWith('ai_analysis_') && 
      Date.now() - parseInt(key.split('_').pop()) > 5 * 60 * 1000 // 5 minutos
    );
    
    oldKeys.forEach(key => localStorage.removeItem(key));
  }, []);

  // Limpar cache antigo na inicialização
  useEffect(() => {
    clearOldCache();
  }, [clearOldCache]);

  return {
    analysis,
    loading,
    error,
    hasData,
    refreshAnalysis,
    clearOldCache
  };
};
