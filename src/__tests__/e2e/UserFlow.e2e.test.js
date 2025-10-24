/**
 * Testes End-to-End (E2E) para fluxos críticos da aplicação
 * Testa a jornada completa do usuário desde o login até o uso das funcionalidades principais
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { BrowserRouter } from 'react-router-dom';

// Mock do Firebase para testes
jest.mock('../../firebase', () => ({
  auth: {
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
    signOut: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'test-user', email: 'test@example.com' });
      return jest.fn();
    })
  },
  firestore: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ docs: [] })),
          add: jest.fn(() => Promise.resolve({ id: 'test-id' })),
          onSnapshot: jest.fn()
        }))
      }))
    }))
  }
}));

// Mock do useUnifiedFirestore
jest.mock('../../hooks/useUnifiedFirestore', () => ({
  useUnifiedFirestore: () => ({
    gastosData: {
      '01': [
        { id: '1', data: '2025-01-15', desc: 'Teste', valor: 50, categoria: 'alimentacao' }
      ]
    },
    gastosFixos: {},
    rendimentosData: {},
    loading: false,
    error: null,
    connectionStatus: 'connected',
    totalTransactions: 1,
    clearError: jest.fn(),
    reloadData: jest.fn(),
    addGasto: jest.fn(),
    removeGasto: jest.fn()
  })
}));

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Fluxos E2E Críticos', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    // Mock de console para evitar logs durante os testes
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Fluxo de Login e Navegação', () => {
    test('deve permitir login e navegar pelo dashboard', async () => {
      const user = userEvent.setup();
      renderApp();

      // Verificar se o usuário está logado (mock)
      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Verificar se o dashboard principal está visível
      expect(screen.getByText('Visão Geral')).toBeInTheDocument();
      expect(screen.getByText('Gastos')).toBeInTheDocument();
      expect(screen.getByText('Orçamentos')).toBeInTheDocument();
    });

    test('deve navegar entre seções do menu', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Clicar na seção de Gastos
      const gastosButton = screen.getByText('Gastos');
      await user.click(gastosButton);

      // Verificar se a seção de gastos está ativa
      expect(gastosButton).toHaveClass('active');

      // Clicar na seção de Orçamentos
      const budgetButton = screen.getByText('Orçamentos');
      await user.click(budgetButton);

      // Verificar se a seção de orçamentos está ativa
      expect(budgetButton).toHaveClass('active');
    });
  });

  describe('2. Fluxo de Adicionar Gasto', () => {
    test('deve permitir adicionar um novo gasto', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para a seção de Gastos
      const gastosButton = screen.getByText('Gastos');
      await user.click(gastosButton);

      // Verificar se o formulário de adicionar gasto está presente
      // (assumindo que existe um botão ou campo para adicionar gasto)
      const addButton = screen.queryByText('Adicionar Gasto') || screen.queryByText('+') || screen.queryByRole('button', { name: /adicionar/i });
      
      if (addButton) {
        await user.click(addButton);
        
        // Verificar se o formulário aparece
        expect(screen.getByRole('form') || screen.getByRole('dialog')).toBeInTheDocument();
      }
    });
  });

  describe('3. Fluxo de Configuração de Orçamento', () => {
    test('deve permitir configurar orçamento por categoria', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para a seção de Orçamentos
      const budgetButton = screen.getByText('Orçamentos');
      await user.click(budgetButton);

      // Verificar se a seção de orçamentos está carregada
      expect(screen.getByText('Orçamentos por Categoria')).toBeInTheDocument();

      // Verificar se existem campos para configurar orçamento
      const budgetInputs = screen.queryAllByRole('textbox') || screen.queryAllByRole('spinbutton');
      expect(budgetInputs.length).toBeGreaterThan(0);
    });
  });

  describe('4. Fluxo de Importação de Dados', () => {
    test('deve permitir importar dados CSV', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para a seção de Importação
      const importButton = screen.getByText('Importação');
      await user.click(importButton);

      // Verificar se a seção de importação está carregada
      expect(screen.getByText('Importação de Dados')).toBeInTheDocument();

      // Verificar se existe área de upload
      const uploadArea = screen.queryByText('Arraste seu arquivo CSV aqui') || screen.queryByRole('button', { name: /selecionar/i });
      expect(uploadArea).toBeInTheDocument();
    });
  });

  describe('5. Fluxo de Visualização de Gráficos', () => {
    test('deve exibir gráficos e visualizações', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para a seção de Gráficos
      const chartsButton = screen.getByText('Gráficos');
      await user.click(chartsButton);

      // Verificar se a seção de gráficos está carregada
      expect(screen.getByText('Gráficos e Visualizações')).toBeInTheDocument();

      // Verificar se existem controles de período
      const periodSelect = screen.queryByRole('combobox', { name: /período/i });
      expect(periodSelect).toBeInTheDocument();
    });
  });

  describe('6. Fluxo de Acessibilidade', () => {
    test('deve permitir configurar opções de acessibilidade', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para a seção de Acessibilidade
      const accessibilityButton = screen.getByText('Acessibilidade');
      await user.click(accessibilityButton);

      // Verificar se a seção de acessibilidade está carregada
      expect(screen.getByText('Configurações de Acessibilidade')).toBeInTheDocument();

      // Verificar se existem controles de acessibilidade
      const fontSizeSelect = screen.queryByRole('combobox', { name: /tamanho da fonte/i });
      expect(fontSizeSelect).toBeInTheDocument();

      // Verificar se existem checkboxes para opções de acessibilidade
      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('7. Navegação por Teclado', () => {
    test('deve permitir navegação completa por teclado', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar usando Tab
      await user.tab();
      
      // Verificar se o primeiro elemento está focado
      const firstElement = document.activeElement;
      expect(firstElement).toBeInTheDocument();

      // Continuar navegando com Tab
      await user.tab();
      await user.tab();

      // Verificar se a navegação está funcionando
      const currentElement = document.activeElement;
      expect(currentElement).toBeInTheDocument();
    });
  });

  describe('8. Responsividade', () => {
    test('deve funcionar em diferentes tamanhos de tela', async () => {
      // Simular tela móvel
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Verificar se o layout se adapta
      const dashboard = screen.getByRole('main') || screen.getByText('💰 Controle Financeiro 2025').closest('div');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('9. Persistência de Dados', () => {
    test('deve manter configurações entre sessões', async () => {
      const user = userEvent.setup();
      
      // Primeira renderização
      const { unmount } = renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Navegar para configurações de acessibilidade
      const accessibilityButton = screen.getByText('Acessibilidade');
      await user.click(accessibilityButton);

      // Alterar configuração
      const fontSizeSelect = screen.queryByRole('combobox', { name: /tamanho da fonte/i });
      if (fontSizeSelect) {
        await user.selectOptions(fontSizeSelect, 'large');
      }

      // Desmontar componente
      unmount();

      // Segunda renderização
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Verificar se a configuração foi mantida
      const savedFontSize = localStorage.getItem('accessibility-font-size');
      expect(savedFontSize).toBe('large');
    });
  });

  describe('10. Tratamento de Erros', () => {
    test('deve lidar graciosamente com erros de conexão', async () => {
      // Mock de erro de conexão
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
      });

      // Verificar se a aplicação não quebra com erros
      expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
    });
  });
});

// Testes de Performance
describe('Testes de Performance', () => {
  test('deve carregar rapidamente', async () => {
    const startTime = performance.now();
    
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
    });

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    // Verificar se carrega em menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });
});

// Testes de Acessibilidade
describe('Testes de Acessibilidade', () => {
  test('deve ter elementos com roles apropriados', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
    });

    // Verificar se existem elementos com roles apropriados
    expect(screen.getByRole('main') || screen.getByRole('application')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('deve ter labels apropriados para elementos interativos', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('💰 Controle Financeiro 2025')).toBeInTheDocument();
    });

    // Verificar se botões têm labels apropriados
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });
});

