// Application constants

// Rendimentos calculation constants
export const RENDIMENTOS_CONFIG = {
  SALARIO_ANDRE: 144,
  SALARIO_ALINE: 160,
  IVA_RATE: 0.23,
  DIAS_TRABALHADOS_DEFAULT: {
    andre: 22,
    aline: 22
  }
};

// Firebase configuration (will be moved to environment variables)
export const FIREBASE_CONFIG = {
  // This will be populated from environment variables
};

// Months mapping
export const MESES_NOMES = {
  'jan': 'Janeiro',
  'fev': 'Fevereiro',
  'mar': 'Março',
  'abr': 'Abril',
  'mai': 'Maio',
  'jun': 'Junho',
  'jul': 'Julho',
  'ago': 'Agosto',
  'set': 'Setembro',
  'out': 'Outubro',
  'nov': 'Novembro',
  'dez': 'Dezembro'
};

// Months list
export const MESES_LIST = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Default values
export const DEFAULT_VALUES = {
  LOADING_TIMEOUT: 500,
  ERROR_DISPLAY_DURATION: 5000
};
