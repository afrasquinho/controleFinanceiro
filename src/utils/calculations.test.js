import {
  calculateRendimentos,
  calculateGastosFixos,
  calculateGastosVariaveis,
  calculateSaldo,
  formatCurrency,
  getGeneralStats,
  compareMonths,
  detectAnomalousExpenses,
  getDominantCategory
} from './calculations';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('calculations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRendimentos', () => {
    it('should calculate rendimentos correctly', () => {
      localStorageMock.getItem.mockReturnValue(null); // No saved data

      const result = calculateRendimentos('01');

      expect(result).toHaveProperty('andre');
      expect(result).toHaveProperty('aline');
      expect(result).toHaveProperty('extras');
      expect(result).toHaveProperty('total');
      expect(typeof result.total).toBe('number');
    });

    it('should use saved dias trabalhados', () => {
      const savedDias = JSON.stringify({ andre: 20, aline: 18 });
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'diasTrabalhados_01') return savedDias;
        return null;
      });

      const result = calculateRendimentos('01');

      expect(result.andre.dias).toBe(20);
      expect(result.aline.dias).toBe(18);
    });
  });

  describe('calculateGastosFixos', () => {
    it('should calculate gastos fixos total', () => {
      const savedGastos = JSON.stringify({ luz: 100, agua: 50, internet: 75 });
      localStorageMock.getItem.mockReturnValue(savedGastos);

      const result = calculateGastosFixos();

      expect(result).toBe(225);
    });

    it('should use default gastos fixos when no saved data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = calculateGastosFixos();

      expect(typeof result).toBe('number');
    });
  });

  describe('calculateGastosVariaveis', () => {
    it('should calculate total of variable expenses', () => {
      const gastos = [
        { valor: 50 },
        { valor: 30 },
        { valor: 20 }
      ];

      const result = calculateGastosVariaveis(gastos);

      expect(result).toBe(100);
    });

    it('should handle empty array', () => {
      const result = calculateGastosVariaveis([]);

      expect(result).toBe(0);
    });

    it('should handle invalid input', () => {
      const result = calculateGastosVariaveis(null);

      expect(result).toBe(0);
    });
  });

  describe('calculateSaldo', () => {
    it('should calculate balance correctly', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const gastosVariaveis = [{ valor: 100 }, { valor: 50 }];
      const result = calculateSaldo('01', gastosVariaveis);

      expect(result).toHaveProperty('rendimentos');
      expect(result).toHaveProperty('gastosFixos');
      expect(result).toHaveProperty('gastosVariaveis');
      expect(result).toHaveProperty('gastosTotal');
      expect(result).toHaveProperty('saldo');
      expect(result.gastosVariaveis).toBe(150);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(123.45)).toBe('123,45 €');
      expect(formatCurrency(0)).toBe('0,00 €');
      expect(formatCurrency(-50)).toBe('-50,00 €');
    });

    it('should handle invalid input', () => {
      expect(formatCurrency('invalid')).toBe('0,00 €');
      expect(formatCurrency(null)).toBe('0,00 €');
      expect(formatCurrency(undefined)).toBe('0,00 €');
    });
  });

  describe('getGeneralStats', () => {
    it('should calculate general statistics', () => {
      const gastosData = {
        '01': [
          { valor: 100 },
          { valor: 200 },
          { valor: 50 }
        ],
        '02': [
          { valor: 75 },
          { valor: 25 }
        ]
      };

      const result = getGeneralStats(gastosData);

      expect(result.totalTransactions).toBe(5);
      expect(result.totalAmount).toBe(450);
      expect(result.averageTransaction).toBe(90);
      expect(result.maxTransaction).toBe(200);
      expect(result.minTransaction).toBe(25);
    });

    it('should handle empty data', () => {
      const result = getGeneralStats({});

      expect(result.totalTransactions).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.averageTransaction).toBe(0);
    });
  });

  describe('compareMonths', () => {
    it('should compare two months correctly', () => {
      const gastosData = {
        '01': [{ valor: 100 }, { valor: 50 }],
        '02': [{ valor: 200 }, { valor: 75 }]
      };

      const result = compareMonths(gastosData, '01', '02');

      expect(result.month1.total).toBe(150);
      expect(result.month2.total).toBe(275);
      expect(result.difference).toBe(125);
      expect(result.trend).toBe('increase');
    });
  });

  describe('detectAnomalousExpenses', () => {
    it('should detect anomalous expenses', () => {
      const gastosData = {
        '01': [
          { valor: 10 },
          { valor: 15 },
          { valor: 12 },
          { valor: 100 }, // Anomalous
          { valor: 8 }
        ]
      };

      const result = detectAnomalousExpenses(gastosData);

      expect(result.length).toBe(1);
      expect(result[0].valor).toBe(100);
    });

    it('should return empty array for insufficient data', () => {
      const gastosData = {
        '01': [{ valor: 10 }, { valor: 15 }]
      };

      const result = detectAnomalousExpenses(gastosData);

      expect(result).toEqual([]);
    });
  });

  describe('getDominantCategory', () => {
    it('should identify dominant category', () => {
      const gastosData = {
        '01': [
          { desc: 'Supermercado Continente', valor: 100 },
          { desc: 'Gasolina BP', valor: 50 },
          { desc: 'Supermercado Pingo Doce', valor: 80 }
        ]
      };

      const result = getDominantCategory(gastosData);

      expect(result.category).toBe('Alimentação');
      expect(result.amount).toBe(180);
      expect(result.percentage).toBe('72.0');
    });
  });
});
