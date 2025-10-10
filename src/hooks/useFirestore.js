// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js'; // Certifique-se de que o caminho está correto

export const useFirestore = () => {
  const [gastosData, setGastosData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔥 Carregando dados do Firestore...');

        const gastosRef = collection(db, 'financeiro', 'gastos2025');
        const snapshot = await getDocs(gastosRef);
        
        const allData = {};
        snapshot.forEach((doc) => {
          allData[doc.id] = doc.data();
        });

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
