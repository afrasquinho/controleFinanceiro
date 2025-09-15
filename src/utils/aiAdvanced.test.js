import {
  AdvancedFinancialAI,
  analyzeWithAI,
  categorizeExpense,
  predictNextMonth,
  getFinancialHealth,
  detectExpenseAnomalies,
  getQuickStats
} from './aiAdvanced';

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('AdvancedFinancialAI', () => {
  let ai;

  beforeEach(() => {
    ai = new AdvancedFinancialAI();
  });

  describe('smartCategorize', () => {
    it('should categorize food expenses correctly', () => {
      expect(ai.smartCategorize('Supermercado Continente')).toBe('Alimentação');
      expect(ai.smartCategorize('Restaurante pizza')).toBe('Alimentação');
      expect(ai.smartCategorize('Café da manhã')).toBe('Alimentação');
    });

    it('should categorize transportation expenses correctly', () => {
      expect(ai.smartCategorize('Gasolina BP')).toBe('Transporte');
      expect(ai.smartCategorize('Bilhete autocarro')).toBe('Transporte');
      expect(ai.smartCategorize('Uber aeroporto')).toBe('Transporte');
    });

    it('should categorize health expenses correctly', () => {
      expect(ai.smartCategorize('Farmácia')).toBe('Saúde');
      expect(ai.smartCategorize('Consulta médico')).toBe('Saúde');
      expect(ai.smartCategorize('Medicamentos')).toBe('Saúde');
    });

    it('should return "Outros" for uncategorized expenses', () => {
      expect(ai.smartCategorize('')).toBe('Outros');
      expect(ai.smartCategorize('Compra misteriosa')).toBe('Outros');
    });
  });

  describe('processData', () => {
    it('should process valid expense data correctly', () => {
      const gastosData = {
        '01': [
          { desc: 'Supermercado', valor: 100 },
          { desc: 'Gasolina', valor: 50 }
        ]
      };

      const result = ai.processData(gastosData);

      expect(result.totalExpenses).toBe(150);
      expect(result.totalTransactions).toBe(2);
      expect(result.expenses).toHaveLength(2);
      expect(result.monthlyData['01'].total).toBe(150);
    });

    it('should handle empty data', () => {
      const result = ai.processData({});

      expect(result.totalExpenses).toBe(0);
      expect(result.totalTransactions).toBe(0);
      expect(result.expenses).toHaveLength(0);
    });

    it('should filter out invalid expenses', () => {
      const gastosData = {
        '01': [
          { desc: 'Valid expense', valor: 100 },
          { desc: 'Invalid expense', valor: -50 },
          { desc: 'Another invalid', valor: 0 },
          { desc: 'Valid expense 2', valor: 75 }
        ]
      };

      const result = ai.processData(gastosData);

      expect(result.totalExpenses).toBe(175);
      expect(result.totalTransactions).toBe(2);
    });
  });

  describe('categorizeExpenses', () => {
    it('should categorize expenses and calculate totals', () => {
      const processedData = {
        expenses: [
          { id: '1', description: 'Supermercado', value: 100 },
          { id: '2', description: 'Gasolina', value: 50 },
          { id: '3', description: 'Supermercado', value: 80 }
        ],
        monthlyData: {},
        totalExpenses: 230,
        totalTransactions: 3,
        averageTransaction: 76.67
      };

      const result = ai.categorizeExpenses(processedData);

      expect(result.categories).toHaveProperty('Alimentação');
      expect(result.categories).toHaveProperty('Transporte');
      expect(result.categories['Alimentação'].total).toBe(180);
      expect(result.categories['Transporte'].total).toBe(50);
    });
  });

  describe('calculateTrend', () => {
    it('should detect increasing trend', () => {
      const monthlyTotals = [100, 120, 140, 160, 180, 200];

      const result = ai.calculateTrend(monthlyTotals);

      expect(result.direction).toBe('increasing');
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should detect decreasing trend', () => {
      const monthlyTotals = [200, 180, 160, 140, 120, 100];

      const result = ai.calculateTrend(monthlyTotals);

      expect(result.direction).toBe('decreasing');
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should detect stable trend', () => {
      const monthlyTotals = [100, 105, 95, 100, 98, 102];

      const result = ai.calculateTrend(monthlyTotals);

      expect(result.direction).toBe('stable');
    });

    it('should handle insufficient data', () => {
      const monthlyTotals = [100, 120];

      const result = ai.calculateTrend(monthlyTotals);

      expect(result.direction).toBe('insufficient_data');
    });
  });

  describe('detectAnomalies', () => {
    it('should detect anomalous expenses', () => {
      const expenses = [
        { id: '1', value: 10 },
        { id: '2', value: 15 },
        { id: '3', value: 12 },
        { id: '4', value: 100 }, // Anomalous
        { id: '5', value: 8 }
      ];

      const result = ai.detectAnomalies(expenses);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4');
      expect(result[0]).toHaveProperty('zScore');
      expect(result[0]).toHaveProperty('severity');
    });

    it('should return empty array for insufficient data', () => {
      const expenses = [
        { id: '1', value: 10 },
        { id: '2', value: 15 }
      ];

      const result = ai.detectAnomalies(expenses);

      expect(result).toEqual([]);
    });
  });

  describe('generatePredictions', () => {
    it('should generate predictions for sufficient data', () => {
      const data = {
        monthlyData: {
          '01': { total: 100 },
          '02': { total: 120 },
          '03': { total: 110 },
          '04': { total: 130 },
          '05': { total: 125 },
          '06': { total: 140 }
        }
      };

      const result = ai.generatePredictions(data);

      expect(result).toHaveProperty('nextMonth');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('range');
      expect(result).toHaveProperty('methods');
      expect(typeof result.nextMonth).toBe('number');
    });

    it('should handle insufficient data', () => {
      const data = {
        monthlyData: {
          '01': { total: 100 }
        }
      };

      const result = ai.generatePredictions(data);

      expect(result.nextMonth).toBe(0);
      expect(result.confidence).toBe('low');
    });
  });

  describe('calculateHealthScore', () => {
    it('should calculate health score correctly', () => {
      const data = {
        categories: {
          'Alimentação': { total: 300, count: 10, percentage: 30 },
          'Transporte': { total: 200, count: 5, percentage: 20 },
          'Lazer': { total: 100, count: 3, percentage: 10 }
        },
        monthlyData: {
          '01': { total: 100 },
          '02': { total: 110 },
          '03': { total: 105 },
          '04': { total: 115 },
          '05': { total: 120 },
          '06': { total: 125 }
        },
        categorizedExpenses: [
          { value: 50 }, { value: 60 }, { value: 40 }, { value: 55 }, { value: 45 }
        ]
      };

      const result = ai.calculateHealthScore(data, {});

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('factors');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(ai.formatCurrency(123.45)).toBe('123,45 €');
      expect(ai.formatCurrency(0)).toBe('0,00 €');
      expect(ai.formatCurrency(-50)).toBe('-50,00 €');
    });

    it('should handle invalid input', () => {
      expect(ai.formatCurrency('invalid')).toBe('0,00 €');
      expect(ai.formatCurrency(null)).toBe('0,00 €');
      expect(ai.formatCurrency(undefined)).toBe('0,00 €');
    });
  });
});

describe('Utility Functions', () => {
  describe('analyzeWithAI', () => {
    it('should analyze data successfully', () => {
      const gastosData = {
        '01': [
          { desc: 'Supermercado', valor: 100 },
          { desc: 'Gasolina', valor: 50 }
        ]
      };

      const result = analyzeWithAI(gastosData);

      expect(result).toHaveProperty('processedData');
      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('predictions');
      expect(result).toHaveProperty('insights');
      expect(result).toHaveProperty('healthScore');
    });

    it('should handle invalid input', () => {
      const result = analyzeWithAI(null);

      expect(result).toHaveProperty('processedData');
      expect(result.processedData.totalExpenses).toBe(0);
    });
  });

  describe('categorizeExpense', () => {
    it('should categorize expense correctly', () => {
      expect(categorizeExpense('Supermercado')).toBe('Alimentação');
      expect(categorizeExpense('Gasolina')).toBe('Transporte');
      expect(categorizeExpense('')).toBe('Outros');
    });
  });

  describe('predictNextMonth', () => {
    it('should predict next month expenses', () => {
      const gastosData = {
        '01': [{ desc: 'Test', valor: 100 }],
        '02': [{ desc: 'Test', valor: 120 }],
        '03': [{ desc: 'Test', valor: 110 }]
      };

      const result = predictNextMonth(gastosData);

      expect(result).toHaveProperty('nextMonth');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('getFinancialHealth', () => {
    it('should calculate financial health', () => {
      const gastosData = {
        '01': [{ desc: 'Supermercado', valor: 100 }]
      };

      const result = getFinancialHealth(gastosData);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('status');
    });
  });

  describe('detectExpenseAnomalies', () => {
    it('should detect anomalies', () => {
      const gastosData = {
        '01': [
          { desc: 'Normal', valor: 10 },
          { desc: 'Normal', valor: 15 },
          { desc: 'Anomalous', valor: 100 }
        ]
      };

      const result = detectExpenseAnomalies(gastosData);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getQuickStats', () => {
    it('should return quick statistics', () => {
      const gastosData = {
        '01': [
          { desc: 'Supermercado', valor: 100 },
          { desc: 'Gasolina', valor: 50 }
        ]
      };

      const result = getQuickStats(gastosData);

      expect(result).toHaveProperty('totalExpenses');
      expect(result).toHaveProperty('totalTransactions');
      expect(result).toHaveProperty('averageTransaction');
      expect(result).toHaveProperty('topCategory');
      expect(result).toHaveProperty('healthScore');
      expect(result.totalExpenses).toBe(150);
      expect(result.totalTransactions).toBe(2);
    });

    it('should handle empty data', () => {
      const result = getQuickStats({});

      expect(result.totalExpenses).toBe(0);
      expect(result.totalTransactions).toBe(0);
      expect(result.averageTransaction).toBe(0);
      expect(result.topCategory).toBeNull();
      expect(result.healthScore).toBe(0);
    });
  });
});
