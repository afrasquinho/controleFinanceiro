import { lazy } from 'react';

/**
 * Lazy loading de componentes para otimização de bundle
 * Divide o código em chunks menores para melhor performance
 */

// Dashboard Sections - Carregadas sob demanda
export const OverviewSection = lazy(() => 
  import('../components/DashboardSections/OverviewSection.js')
);

export const ExpensesSection = lazy(() => 
  import('../components/DashboardSections/ExpensesSection.js')
);

export const PredictionsSection = lazy(() => 
  import('../components/DashboardSections/PredictionsSection.js')
);

export const AnalyticsSection = lazy(() => 
  import('../components/DashboardSections/AnalyticsSection.js')
);

export const SettingsSection = lazy(() => 
  import('../components/DashboardSections/SettingsSection.js')
);

// Month Sections - Carregadas quando necessário
export const RendimentosSection = lazy(() => 
  import('../components/RendimentosSection.js')
);

export const DividasSection = lazy(() => 
  import('../components/DividasSection.js')
);

export const GastosFixosSection = lazy(() => 
  import('../components/GastosFixosSection.js')
);

export const GastosVariaveisSection = lazy(() => 
  import('../components/GastosVariaveisSection.js')
);

export const SummarySection = lazy(() => 
  import('../components/SummarySection.js')
);

// Utility Components
export const AIDashboard = lazy(() => 
  import('../components/AIDashboard.js')
);

export const QuickStats = lazy(() => 
  import('../components/QuickStats.js')
);

export const DownloadSection = lazy(() => 
  import('../components/DownloadSection.js')
);

// Hooks com lazy loading
export const useAIAnalysis = lazy(() => 
  import('../hooks/useAIAnalysis.js')
);

// Utils com lazy loading
export const aiAdvanced = lazy(() => 
  import('../utils/aiAdvanced.js')
);

/**
 * Preload de componentes críticos
 * Carrega componentes importantes em background
 */
export const preloadCriticalComponents = () => {
  // Preload do OverviewSection após 2 segundos
  setTimeout(() => {
    OverviewSection();
  }, 2000);
  
  // Preload do QuickStats após 3 segundos
  setTimeout(() => {
    QuickStats();
  }, 3000);
};

/**
 * Preload baseado na interação do usuário
 */
export const preloadOnHover = (component) => {
  return () => {
    // Preload quando o usuário hover sobre um item do menu
    component();
  };
};

/**
 * Configuração de fallback para componentes lazy
 */
export const LazyFallback = ({ componentName }) => (
  <div 
    className="lazy-fallback animate-pulse"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '8px',
      margin: '20px 0'
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div className="loading-skeleton" style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        margin: '0 auto 20px'
      }}></div>
      <div className="loading-skeleton" style={{
        width: '200px',
        height: '20px',
        borderRadius: '4px',
        margin: '0 auto 10px'
      }}></div>
      <div className="loading-skeleton" style={{
        width: '150px',
        height: '16px',
        borderRadius: '4px',
        margin: '0 auto'
      }}></div>
      <p style={{ 
        marginTop: '20px', 
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        Carregando {componentName}...
      </p>
    </div>
  </div>
);

/**
 * Hook para preload inteligente
 */
export const usePreload = () => {
  const preloadComponent = (component) => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        component();
      });
    } else {
      setTimeout(() => {
        component();
      }, 100);
    }
  };

  return { preloadComponent };
};
