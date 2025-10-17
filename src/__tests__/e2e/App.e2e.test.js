/**
 * @fileoverview Testes End-to-End (E2E) para a aplicação
 * Testa fluxos completos de usuário e integração entre componentes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App.js';

// Mock do Firebase
jest.mock('../../firebase.js', () => ({
  db: {},
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn()
  }
}));

// Mock do hook useUnifiedFirestore
jest.mock('../../hooks/useUnifiedFirestore.js', () => ({
  useUnifiedFirestore: () => ({
    gastosData: {
      '01': [
        { id: '1', desc: 'Test expense', valor: 100, data: '2025-01-01' }
      ]
    },
    gastosFixos: { '01': { luz: 150, agua: 80 } },
    rendimentosData: { '01': [{ id: '1', desc: 'Salary', valor: 3000, data: '2025-01-01' }] },
    diasTrabalhados: { '01': { andre: 22, aline: 20 } },
    dividasData: { '01': [{ id: '1', credor: 'Bank', valor: 500, status: 'pendente' }] },
    loading: false,
    error: null,
    connectionStatus: 'connected',
    totalTransactions: 1,
    userId: 'test-user-id',
    clearError: jest.fn(),
    reloadData: jest.fn(),
    addGasto: jest.fn(),
    removeGasto: jest.fn(),
    updateGastosFixos: jest.fn(),
    updateDiasTrabalhados: jest.fn(),
    addRendimentoExtra: jest.fn(),
    removeRendimentoExtra: jest.fn(),
    addDivida: jest.fn(),
    removeDivida: jest.fn(),
    updateDividaStatus: jest.fn()
  })
}));

// Mock do hook useTheme
jest.mock('../../hooks/useTheme.js', () => ({
  useTheme: () => ({
    theme: 'light',
    isDark: false,
    isLight: true,
    toggleTheme: jest.fn(),
    setThemeMode: jest.fn()
  })
}));

// Mock do hook useAIAnalysis
jest.mock('../../hooks/useAIAnalysis.js', () => ({
  useAIAnalysis: () => ({
    analysis: {
      processedData: {
        totalExpenses: 100,
        totalTransactions: 1,
        averageTransaction: 100
      },
      patterns: {
        topCategories: [{ category: 'Alimentação', percentage: 60 }]
      },
      healthScore: { score: 75 }
    },
    loading: false,
    error: null,
    hasData: true,
    refreshAnalysis: jest.fn(),
    clearOldCache: jest.fn()
  })
}));

// Mock das métricas de performance
jest.mock('../../utils/performanceMetrics.js', () => ({
  recordMetric: jest.fn(),
  measureExecution: jest.fn()
}));

/**
 * Helper para renderizar App com providers necessários
 */
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App E2E Tests', () => {
  beforeEach(() => {
    // Limpar localStorage
    localStorage.clear();
    
    // Mock window.performance
    Object.defineProperty(window, 'performance', {
      value: {
        timing: {
          navigationStart: Date.now()
        }
      },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Fluxo de Autenticação', () => {
    test('deve renderizar Dashboard quando usuário está autenticado', async () => {
      renderApp();
      
      // Verificar se o Dashboard é renderizado
      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro')).toBeInTheDocument();
      });
      
      // Verificar se as seções do dashboard estão presentes
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Gastos')).toBeInTheDocument();
      expect(screen.getByText('Previsões')).toBeInTheDocument();
      expect(screen.getByText('Análises')).toBeInTheDocument();
      expect(screen.getByText('Configurações')).toBeInTheDocument();
    });

    test('deve mostrar status de conexão', async () => {
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('Conectado')).toBeInTheDocument();
      });
    });
  });

  describe('Navegação entre Seções', () => {
    test('deve navegar entre seções do dashboard', async () => {
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      });

      // Clicar na seção Gastos
      fireEvent.click(screen.getByText('Gastos'));
      
      // Verificar se a seção foi ativada
      const gastosButton = screen.getByText('Gastos');
      expect(gastosButton).toHaveClass('active');
    });

    test('deve suportar navegação por teclado', async () => {
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      });

      // Focar na navegação
      const nav = screen.getByRole('navigation');
      fireEvent.keyDown(nav, { key: 'ArrowDown' });
      
      // Verificar se a próxima seção foi ativada
      await waitFor(() => {
        const gastosButton = screen.getByText('Gastos');
        expect(gastosButton).toHaveClass('active');
      });
    });
  });

  describe('Funcionalidades de IA', () => {
    test('deve mostrar estatísticas rápidas com IA', async () => {
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('📊 Estatísticas Rápidas')).toBeInTheDocument();
      });
      
      // Verificar se as estatísticas estão sendo exibidas
      expect(screen.getByText('R$ 100,00')).toBeInTheDocument(); // Total gasto
      expect(screen.getByText('1')).toBeInTheDocument(); // Total transações
      expect(screen.getByText('🤖 IA Ativa')).toBeInTheDocument();
    });

    test('deve mostrar score de saúde financeira', async () => {
      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('75/100')).toBeInTheDocument();
        expect(screen.getByText('Score Financeiro')).toBeInTheDocument();
      });
    });
  });

  describe('Tema e Acessibilidade', () => {
    test('deve ter toggle de tema', async () => {
      renderApp();
      
      await waitFor(() => {
        const themeToggle = screen.getByLabelText(/Alternar para tema/i);
        expect(themeToggle).toBeInTheDocument();
      });
    });

    test('deve ter navegação acessível', async () => {
      renderApp();
      
      await waitFor(() => {
        const nav = screen.getByRole('navigation');
        expect(nav).toHaveAttribute('aria-label', 'Navegação principal');
      });
    });

    test('deve ter skip link para acessibilidade', async () => {
      renderApp();
      
      const skipLink = screen.getByText('Pular para conteúdo principal');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Performance e Loading', () => {
    test('deve mostrar loading state inicialmente', async () => {
      // Mock loading state
      jest.doMock('../../hooks/useUnifiedFirestore.js', () => ({
        useUnifiedFirestore: () => ({
          gastosData: {},
          loading: true,
          error: null,
          connectionStatus: 'connecting',
          totalTransactions: 0,
          userId: 'test-user-id',
          clearError: jest.fn(),
          reloadData: jest.fn(),
          addGasto: jest.fn(),
          removeGasto: jest.fn()
        })
      }));

      renderApp();
      
      expect(screen.getByText('Conectando ao Firebase')).toBeInTheDocument();
      expect(screen.getByText('Carregando seus dados financeiros...')).toBeInTheDocument();
    });

    test('deve registrar métricas de performance', async () => {
      const { recordMetric } = require('../../utils/performanceMetrics.js');
      
      renderApp();
      
      await waitFor(() => {
        expect(recordMetric).toHaveBeenCalledWith('app_initialization', expect.any(Number));
      });
    });
  });

  describe('Error Handling', () => {
    test('deve mostrar erro quando há problemas de conexão', async () => {
      // Mock error state
      jest.doMock('../../hooks/useUnifiedFirestore.js', () => ({
        useUnifiedFirestore: () => ({
          gastosData: {},
          loading: false,
          error: 'Erro de conexão com Firebase',
          connectionStatus: 'error',
          totalTransactions: 0,
          userId: 'test-user-id',
          clearError: jest.fn(),
          reloadData: jest.fn(),
          addGasto: jest.fn(),
          removeGasto: jest.fn()
        })
      }));

      renderApp();
      
      expect(screen.getByText('❌ Erro de conexão com Firebase')).toBeInTheDocument();
      expect(screen.getByText('🔄 Tentar Novamente')).toBeInTheDocument();
    });

    test('deve permitir limpar erro', async () => {
      const mockClearError = jest.fn();
      
      jest.doMock('../../hooks/useUnifiedFirestore.js', () => ({
        useUnifiedFirestore: () => ({
          gastosData: {},
          loading: false,
          error: 'Erro de conexão',
          connectionStatus: 'error',
          totalTransactions: 0,
          userId: 'test-user-id',
          clearError: mockClearError,
          reloadData: jest.fn(),
          addGasto: jest.fn(),
          removeGasto: jest.fn()
        })
      }));

      renderApp();
      
      const clearButton = screen.getByText('✕ Fechar');
      fireEvent.click(clearButton);
      
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('PWA Features', () => {
    test('deve ter meta tags para PWA', () => {
      renderApp();
      
      // Verificar se as meta tags estão presentes no head
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      expect(metaTheme).toHaveAttribute('content', '#007bff');
      
      const metaViewport = document.querySelector('meta[name="viewport"]');
      expect(metaViewport).toBeInTheDocument();
    });

    test('deve ter manifest link', () => {
      renderApp();
      
      const manifestLink = document.querySelector('link[rel="manifest"]');
      expect(manifestLink).toHaveAttribute('href', '/manifest.json');
    });
  });

  describe('Responsividade', () => {
    test('deve funcionar em diferentes tamanhos de tela', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      renderApp();
      
      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro')).toBeInTheDocument();
      });
      
      // Verificar se o layout se adapta
      const container = screen.getByRole('main');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('Integration Tests', () => {
  test('deve integrar todos os componentes principais', async () => {
    renderApp();
    
    await waitFor(() => {
      // Verificar se todos os componentes principais estão renderizados
      expect(screen.getByText('💰 Controle Financeiro')).toBeInTheDocument();
      expect(screen.getByText('📊 Estatísticas Rápidas')).toBeInTheDocument();
      expect(screen.getByText('🤖 ASSISTENTE FINANCEIRO IA')).toBeInTheDocument();
    });
  });

  test('deve manter estado consistente entre componentes', async () => {
    renderApp();
    
    await waitFor(() => {
      // Verificar se os dados são consistentes entre componentes
      const totalTransactions = screen.getByText('1');
      expect(totalTransactions).toBeInTheDocument();
    });
  });
});
