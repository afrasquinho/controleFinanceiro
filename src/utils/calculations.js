// src/utils/calculations.js
import { mesesInfo, gastosFixosDefault, valoresDefault } from '../data/monthsData';

export const calculateRendimentos = (mesId) => {
  const mes = mesesInfo.find(m => m.id === mesId);
  
  const rendimentoAndre = valoresDefault.valorAndre * mes.dias;
  const ivaAndre = rendimentoAndre * valoresDefault.iva;
  const totalAndre = rendimentoAndre + ivaAndre;
  
  const rendimentoAline = valoresDefault.valorAline * mes.dias;
  const ivaAline = rendimentoAline * valoresDefault.iva;
  const totalAline = rendimentoAline + ivaAline;
  
  // Calcular rendimentos extras (SEM DUPLICAR)
  const rendimentosExtrasSalvos = localStorage.getItem(`rendimentosExtras_${mesId}`);
  const rendimentosExtras = rendimentosExtrasSalvos ? JSON.parse(rendimentosExtrasSalvos) : [];
  const totalExtras = rendimentosExtras.reduce((total, r) => total + r.valor, 0);
  
  return {
    andre: { base: rendimentoAndre, iva: ivaAndre, total: totalAndre },
    aline: { base: rendimentoAline, iva: ivaAline, total: totalAline },
    extras: totalExtras,
    total: totalAndre + totalAline + totalExtras 
  };
};

// Resto das funções permanecem iguais...
export const calculateGastosFixos = () => {
  const gastosSalvos = localStorage.getItem('gastosFixos');
  const gastosFixos = gastosSalvos ? JSON.parse(gastosSalvos) : gastosFixosDefault;
  
  return Object.values(gastosFixos).reduce((total, valor) => total + valor, 0);
};

export const calculateGastosVariaveis = (gastos) => {
  return gastos.reduce((total, gasto) => total + gasto.valor, 0);
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
  return value.toFixed(2).replace('.', ',') + ' €';
};
