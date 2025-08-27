// src/utils/calculations.js
import { mesesInfo, gastosFixosDefault, valoresDefault } from '../data/monthsData';

// Importar a IA avançada
import { analyzeWithAI, getQuickStats, testAI } from './aiAdvanced';

export const calculateRendimentos = (mesId) => {
  const mes = mesesInfo.find(m => m.id === mesId);
  
  // Carregar dias salvos (se existirem)
  const diasSalvos = localStorage.getItem(`diasTrabalhados_${mesId}`);
  const dias = diasSalvos ? JSON.parse(diasSalvos) : { andre: mes.dias, aline: mes.dias };
  
  const rendimentoAndre = valoresDefault.valorAndre * dias.andre;
  const ivaAndre = rendimentoAndre * valoresDefault.iva;
  const totalAndre = rendimentoAndre + ivaAndre;
  
  const rendimentoAline = valoresDefault.valorAline * dias.aline;
  const ivaAline = rendimentoAline * valoresDefault.iva;
  const totalAline = rendimentoAline + ivaAline;
  
  // Calcular rendimentos extras
  const rendimentosExtrasSalvos = localStorage.getItem(`rendimentosExtras_${mesId}`);
  const rendimentosExtras = rendimentosExtrasSalvos ? JSON.parse(rendimentosExtrasSalvos) : [];
  const totalExtras = rendimentosExtras.reduce((total, r) => total + r.valor, 0);
  
  return {
    andre: { 
      base: rendimentoAndre, 
      iva: ivaAndre, 
      total: totalAndre,
      dias: dias.andre
    },
    aline: { 
      base: rendimentoAline, 
      iva: ivaAline, 
      total: totalAline,
      dias: dias.aline
    },
    extras: totalExtras,
    total: totalAndre + totalAline + totalExtras
  };
};

export const calculateGastosFixos = () => {
  const gastosSalvos = localStorage.getItem('gastosFixos');
  const gastosFixos = gastosSalvos ? JSON.parse(gastosSalvos) : gastosFixosDefault;
  
  return Object.values(gastosFixos).reduce((total, valor) => total + valor, 0);
};

export const calculateGastosVariaveis = (gastos) => {
  if (!Array.isArray(gastos)) return 0;
  return gastos.reduce((total, gasto) => total + (gasto.valor || 0), 0);
};

export const calculateSaldo = (mesId, gastosVariaveis) => {
  const rendimentos = calculateRendimentos(mesId);
  const gastosFixos = calculateGastosFixos();
  const gastosVar = calculateGastosVariaveis(gastosVariaveis);
  const gastosTotal = gastosFixos + gastosVar;
  
  return {
    rendimentos: rendimentos.total,
    gastosFixos,
    gastosVariaveis: gastosVar,
    gastosTotal,
    saldo: rendimentos.total - gastosTotal
  };
};

export const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return '0,00 €';
  return value.toFixed(2).replace('.', ',') + ' €';
};

// NOVAS FUNÇÕES COM IA

// Análise completa com IA
export const analyzeFinancialDataWithAI = (gastosData, rendimentosData = {}) => {
  try {
    return analyzeWithAI(gastosData, rendimentosData);
  } catch (error) {
    console.error('Erro na análise IA:', error);
    return getBasicAnalysis(gastosData);
  }
};

// Análise básica como fallback
const getBasicAnalysis = (gastosData) => {
  const totalGastos = Object.values(gastosData).flat().reduce((total, gasto) => total + (gasto.valor || 0), 0);
  
  return {
    processedData: {
      totalExpenses: totalGastos,
      categories: categorizeBasic(gastosData),
      monthlyData: getMonthlyTotals(gastosData)
    },
    insights: [{
      type: 'basic',
      title: '📊 Análise Básica',
      description: `Total de gastos: ${formatCurrency(totalGastos)}`,
      priority: 'low'
    }],
    predictions: {
      nextMonth: totalGastos / 12,
      confidence: 'low'
    },
    recommendations: [],
    alerts: [],
    patterns: {},
    healthScore: { score: 50, status: 'unknown' }
  };
};

// Categorização básica
const categorizeBasic = (gastosData) => {
  const categories = {};
  
  Object.values(gastosData).flat().forEach(gasto => {
    if (!gasto || !gasto.desc) return;
    
    const desc = gasto.desc.toLowerCase();
    let category = 'Outros';
    
    if (desc.includes('supermercado') || desc.includes('comida')) category = 'Alimentação';
    else if (desc.includes('combustível') || desc.includes('gasolina')) category = 'Transporte';
    else if (desc.includes('farmácia') || desc.includes('médico')) category = 'Saúde';
    else if (desc.includes('cinema') || desc.includes('lazer')) category = 'Lazer';
    else if (desc.includes('roupa') || desc.includes('shopping')) category = 'Vestuário';
    else if (desc.includes('luz') || desc.includes('água')) category = 'Casa';
    
    categories[category] = (categories[category] || 0) + (gasto.valor || 0);
  });
  
  return categories;
};

// Totais mensais
const getMonthlyTotals = (gastosData) => {
  const monthlyData = {};
  
  Object.entries(gastosData).forEach(([month, gastos]) => {
    const total = Array.isArray(gastos) ? 
      gastos.reduce((sum, gasto) => sum + (gasto.valor || 0), 0) : 0;
    
    monthlyData[month] = {
      total,
      count: Array.isArray(gastos) ? gastos.length : 0
    };
  });
  
  return monthlyData;
};

// Previsão simples
export const predictNextMonthExpenses = (gastosData) => {
  const monthlyTotals = Object.values(getMonthlyTotals(gastosData)).map(m => m.total);
  const validTotals = monthlyTotals.filter(t => t > 0);
  
  if (validTotals.length === 0) return 0;
  if (validTotals.length < 3) return validTotals.reduce((a, b) => a + b, 0) / validTotals.length;
  
  // Usar últimos 3 meses para previsão
  const recent = validTotals.slice(-3);
  const average = recent.reduce((a, b) => a + b, 0) / recent.length;
  const trend = (recent[2] - recent[0]) / 2;
  
  return Math.max(0, average + trend);
};

// Obter insights rápidos
export const getQuickInsights = (gastosData) => {
  const analysis = analyzeFinancialDataWithAI(gastosData);
  return analysis.insights.slice(0, 3); // Primeiros 3 insights
};

// Verificar saúde financeira
export const getFinancialHealthScore = (gastosData, rendimentosData = {}) => {
  const analysis = analyzeFinancialDataWithAI(gastosData, rendimentosData);
  return analysis.healthScore;
};

// Obter categoria dominante
export const getDominantCategory = (gastosData) => {
  const categories = categorizeBasic(gastosData);
  const entries = Object.entries(categories);
  
  if (entries.length === 0) return null;
  
  const [category, amount] = entries.sort(([,a], [,b]) => b - a)[0];
  const total = Object.values(categories).reduce((a, b) => a + b, 0);
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  
  return {
    category,
    amount,
    percentage: percentage.toFixed(1)
  };
};

// Detectar gastos anômalos
export const detectAnomalousExpenses = (gastosData) => {
  const allExpenses = Object.values(gastosData).flat().filter(g => g && g.valor);
  
  if (allExpenses.length < 5) return [];
  
  const values = allExpenses.map(g => g.valor);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const threshold = average * 2; // Gastos 2x acima da média
  
  return allExpenses.filter(expense => expense.valor > threshold);
};

// Calcular economia potencial
export const calculatePotentialSavings = (gastosData) => {
  const analysis = analyzeFinancialDataWithAI(gastosData);
  
  if (!analysis.recommendations || analysis.recommendations.length === 0) {
    return { total: 0, recommendations: [] };
  }
  
  const total = analysis.recommendations.reduce((sum, rec) => 
    sum + (rec.potentialSaving || rec.potential_saving || 0), 0
  );
  
  return {
    total,
    recommendations: analysis.recommendations
  };
};

// Comparar meses
export const compareMonths = (gastosData, month1, month2) => {
  const data1 = gastosData[month1] || [];
  const data2 = gastosData[month2] || [];
  
  const total1 = calculateGastosVariaveis(data1);
  const total2 = calculateGastosVariaveis(data2);
  
  const difference = total2 - total1;
  const percentageChange = total1 > 0 ? (difference / total1) * 100 : 0;
  
  return {
    month1: { name: month1, total: total1 },
    month2: { name: month2, total: total2 },
    difference,
    percentageChange: percentageChange.toFixed(1),
    trend: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'stable'
  };
};

// Obter estatísticas gerais
export const getGeneralStats = (gastosData) => {
  const allExpenses = Object.values(gastosData).flat().filter(g => g && g.valor);
  
  if (allExpenses.length === 0) {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      averageTransaction: 0,
      maxTransaction: 0,
      minTransaction: 0
    };
  }
  
  const values = allExpenses.map(g => g.valor);
  const total = values.reduce((a, b) => a + b, 0);
  
  return {
    totalTransactions: allExpenses.length,
    totalAmount: total,
    averageTransaction: total / allExpenses.length,
    maxTransaction: Math.max(...values),
    minTransaction: Math.min(...values)
  };
};
// Exportar as funções da IA
export { analyzeWithAI, getQuickStats, testAI };
// Função para integrar IA com os cálculos existentes
export const getEnhancedMonthAnalysis = (mesId, gastosVariaveis, gastosData) => {
  const basicAnalysis = calculateSaldo(mesId, gastosVariaveis);
  const aiAnalysis = analyzeWithAI(gastosData);
  
  return {
    ...basicAnalysis,
    ai: {
      healthScore: aiAnalysis.healthScore.score,
      topInsight: aiAnalysis.insights[0],
      nextMonthPrediction: aiAnalysis.predictions.nextMonth,
      topRecommendation: aiAnalysis.recommendations[0]
    }
  };
}
/// src/utils/calculations.js (adicionar no final)

// Importar e re-exportar as funções da IA
export { 
  categorizeExpense,
  predictNextMonth,
  getFinancialHealth,
  detectExpenseAnomalies
} from './aiAdvanced';

// Função de teste para verificar se a IA está funcionando
export const testAIIntegration = () => {
  console.log('🧪 Testando integração da IA...');
  
  const testData = {
    set: [
      { desc: 'Supermercado Continente', valor: 45.50, data: '2024-09-01' },
      { desc: 'Gasolina BP', valor: 60.00, data: '2024-09-05' },
      { desc: 'Restaurante', valor: 25.30, data: '2024-09-10' }
    ]
  };
  
  try {
    const result = analyzeWithAI(testData);
    console.log('✅ IA funcionando! Resultado:', result);
    return result;
  } catch (error) {
    console.error('❌ Erro na IA:', error);
    return null;
  }
};

