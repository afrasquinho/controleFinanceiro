// src/hooks/useFirestore.js
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = () => {
  const [gastosData, setGastosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Função para limpar erros
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Função para recarregar dados
  const reloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log('🔄 Recarregando dados do Firestore...');
      
      const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const allData = {};
      let totalGastos = 0;
      let mesesComDados = 0;

      for (const mes of meses) {
        try {
          // Estrutura: financeiro/gastos2025/gastos/{mes}
          const gastosRef = collection(db, 'financeiro', 'gastos2025', 'gastos', mes);
          const gastosQuery = query(gastosRef, orderBy('data', 'asc'));
          const snapshot = await getDocs(gastosQuery);
          
          const gastosArray = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            gastosArray.push({
              id: doc.id,
              ...data,
              // Garantir que os campos essenciais existam
              data: data.data || '',
              desc: data.desc || 'Sem descrição',
              valor: parseFloat(data.valor) || 0
            });
          });

          if (gastosArray.length > 0) {
            allData[mes] = gastosArray;
            totalGastos += gastosArray.length;
            mesesComDados++;
            console.log(`📅 ${mes.toUpperCase()}: ${gastosArray.length} gastos carregados`);
          } else {
            console.log(`📅 ${mes.toUpperCase()}: Nenhum gasto encontrado`);
          }

        } catch (monthError) {
          console.warn(`⚠️ Erro ao carregar dados do mês ${mes}:`, monthError.message);
          // Não interrompe o carregamento dos outros meses
        }
      }

      console.log(`✅ Carregamento concluído: ${totalGastos} gastos em ${mesesComDados} meses`);
      setGastosData(allData);
      setConnectionStatus('connected');

    } catch (err) {
      console.error('❌ Erro crítico ao carregar dados do Firestore:', err);
      setError(`Erro ao conectar com Firebase: ${err.message}`);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Verificar se há dados
  const hasData = Object.keys(gastosData).length > 0;
  const totalTransactions = Object.values(gastosData).flat().length;

  return {
    gastosData,
    loading,
    error,
    connectionStatus,
    hasData,
    totalTransactions,
    clearError,
    reloadData
  };
};
