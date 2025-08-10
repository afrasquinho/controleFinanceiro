// src/utils/calculations.js
import { mesesInfo, gastosFixosDefault, valoresDefault } from '../data/monthsData';

export const calculateRendimentos = (mesId) => {
  const mes = mesesInfo.find(m => m.id === mesId);
  
  const rendimentoEu = valoresDefault.valorEu * mes.dias;
  const ivaEu = rendimentoEu * valoresDefault.iva;
  const totalEu = rendimentoEu + ivaEu;
  
  const rendimentoEsposa = valoresDefault.valorEsposa * mes.dias;
  const ivaEsposa = rendimentoEsposa * valoresDefault.iva;
  const totalEsposa = rendimentoEsposa + ivaEsposa;
  
  return {
    eu: { base: rendimentoEu, iva: ivaEu, total: totalEu },
    esposa: { base: rendimentoEsposa, iva: ivaEsposa, total: totalEsposa },
    total: totalEu + totalEsposa
  };
};

export const calculateGastosFixos = () => {
  // Tentar carregar gastos salvos, senão usar padrão
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
