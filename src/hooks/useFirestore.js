// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = () => {
  const [gastosData, setGastosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔥 Carregando dados do Firestore...');

        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const allData = {};

        for (const mes of meses) {
          // Ajustar a referência para a nova estrutura
          const gastosRef = collection(db, 'financeiro', 'gastos2025', 'gastos');
          const gastosQuery = query(gastosRef, orderBy('data', 'asc'));
          const snapshot = await getDocs(gastosQuery);
          
          const gastosArray = [];
          snapshot.forEach((doc) => {
            if (doc.id === mes) { // Verifica se o documento é do mês atual
              gastosArray.push({
                id: doc.id,
                ...doc.data()
              });
            }
          });

          if (gastosArray.length > 0) {
            allData[mes] = gastosArray;
            console.log(`📅 ${mes}: ${gastosArray.length} gastos carregados`);
          } else {
            console.log(`⚠️ ${mes}: nenhum gasto encontrado`);
          }
        }

        console.log('✅ Dados carregados do Firestore:', allData);
        setGastosData(allData);

      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        setError('Erro ao conectar com Firebase: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    gastosData,
    loading,
    error
  };
};
