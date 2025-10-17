# 📚 Documentação da API - Controle Financeiro 2025

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── components/          # Componentes React
│   ├── DashboardSections/   # Seções do Dashboard
│   ├── __tests__/          # Testes de componentes
│   └── ...
├── hooks/              # Custom Hooks
├── utils/              # Utilitários e helpers
├── styles/             # Arquivos CSS
├── data/               # Dados estáticos
└── config/             # Configurações
```

## 🔧 Hooks Customizados

### `useUnifiedFirestore()`
Hook principal para gerenciamento de dados Firebase.

```typescript
interface UseUnifiedFirestoreReturn {
  // Dados
  gastosData: Record<string, Gasto[]>;
  gastosFixos: Record<string, Record<string, number>>;
  rendimentosData: Record<string, Rendimento[]>;
  diasTrabalhados: Record<string, DiasTrabalhados>;
  dividasData: Record<string, Divida[]>;
  
  // Estados
  loading: boolean;
  error: string | null;
  connectionStatus: 'connecting' | 'connected' | 'error';
  totalTransactions: number;
  userId: string | null;
  
  // Ações CRUD
  addGasto: (mesId: string, data: string, desc: string, valor: number) => Promise<void>;
  removeGasto: (mesId: string, gastoId: string) => Promise<void>;
  updateGastosFixos: (mesId: string, gastos: Record<string, number>) => Promise<void>;
  updateDiasTrabalhados: (mesId: string, dias: DiasTrabalhados) => Promise<void>;
  addRendimentoExtra: (mesId: string, rendimento: Rendimento) => Promise<void>;
  removeRendimentoExtra: (mesId: string, rendimentoId: string) => Promise<void>;
  addDivida: (mesId: string, divida: Divida) => Promise<void>;
  removeDivida: (mesId: string, dividaId: string) => Promise<void>;
  updateDividaStatus: (mesId: string, dividaId: string, status: string) => Promise<void>;
  
  // Utilitários
  clearError: () => void;
  reloadData: () => Promise<void>;
}
```

### `useAIAnalysis(gastosData, rendimentosData?, debounceDelay?)`
Hook otimizado para análise com IA.

```typescript
interface UseAIAnalysisReturn {
  analysis: AIAnalysis | null;
  loading: boolean;
  error: string | null;
  hasData: boolean;
  refreshAnalysis: () => void;
  clearOldCache: () => void;
}
```

### `useTheme()`
Hook para gerenciamento de tema (light/dark mode).

```typescript
interface UseThemeReturn {
  theme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  toggleTheme: () => void;
  setThemeMode: (theme: 'light' | 'dark') => void;
}
```

### `useDebounce(value, delay)`
Hook para implementar debounce em valores.

```typescript
function useDebounce<T>(value: T, delay: number): T
```

## 🤖 IA e Análises

### `analyzeWithAI(gastosData, rendimentosData?)`
Função principal para análise de dados financeiros.

```typescript
interface AIAnalysis {
  processedData: {
    totalExpenses: number;
    totalTransactions: number;
    averageTransaction: number;
    monthlyBreakdown: Record<string, MonthlyData>;
  };
  patterns: {
    topCategories: CategoryAnalysis[];
    spendingTrends: TrendAnalysis[];
    seasonalPatterns: SeasonalPattern[];
  };
  predictions: {
    nextMonthExpenses: number;
    savingsPotential: number;
    riskFactors: RiskFactor[];
  };
  insights: Insight[];
  recommendations: Recommendation[];
  alerts: Alert[];
  healthScore: {
    score: number;
    factors: HealthFactor[];
  };
}
```

## 📊 Componentes Principais

### `<Dashboard />`
Componente principal do dashboard financeiro.

**Props:** Nenhuma (usa hooks internos)

**Features:**
- Navegação por seções
- Keyboard navigation
- Status de conexão
- Theme toggle

### `<QuickStats />`
Componente para estatísticas rápidas com IA.

```typescript
interface QuickStatsProps {
  gastosData: Record<string, Gasto[]>;
  onOpenAI?: () => void;
}
```

### `<AIDashboard />`
Dashboard completo de análises com IA.

```typescript
interface AIDashboardProps {
  gastosData: Record<string, Gasto[]>;
  rendimentosData?: Record<string, Rendimento[]>;
  currentMonth?: string;
}
```

### `<ThemeToggle />`
Toggle para alternar entre temas claro/escuro.

```typescript
interface ThemeToggleProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}
```

## 🔒 Segurança

### Variáveis de Ambiente
```bash
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Regras Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/financeiro/2025/{document=**} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId
        && request.auth.token.email_verified == true;
    }
  }
}
```

## 🎨 Temas e Estilos

### Variáveis CSS
```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-primary: #dee2e6;
  --primary: #007bff;
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
}
```

### Classes de Animação
```css
.animate-fade-in
.animate-slide-in-left
.animate-slide-in-right
.animate-scale-in
.animate-pulse
.animate-bounce
.hover-lift
.hover-scale
.hover-glow
```

## 📱 PWA

### Manifest
```json
{
  "short_name": "Controle Financeiro",
  "name": "Controle Financeiro 2025 - Powered by IA",
  "display": "standalone",
  "theme_color": "#007bff",
  "background_color": "#ffffff"
}
```

### Service Worker
- Cache de arquivos estáticos
- Cache dinâmico para APIs
- Estratégias de cache por tipo de conteúdo
- Atualizações automáticas

## 🧪 Testes

### Scripts Disponíveis
```bash
npm test                 # Testes em modo watch
npm run test:coverage    # Cobertura de testes
npm run test:ci         # Testes para CI/CD
```

### Estrutura de Testes
```
src/
├── components/__tests__/
├── hooks/__tests__/
└── utils/__tests__/
```

## 🚀 Performance

### Otimizações Implementadas
- Lazy loading de componentes
- Debounce em análises IA
- Cache local para resultados
- Memoização com React.memo
- Service Worker para cache offline
- Code splitting automático

### Métricas
- Bundle size otimizado
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

## 🔧 Desenvolvimento

### Scripts Úteis
```bash
npm start              # Desenvolvimento
npm run build         # Build de produção
npm run lint          # Linting
npm run format        # Formatação
npm run precommit     # Verificações pre-commit
```

### Estrutura de Commits
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

## 📈 Monitoramento

### Métricas de Performance
- Web Vitals
- Bundle size
- Loading times
- Error rates
- User interactions

### Logs
- Console logs apenas em desenvolvimento
- Error tracking
- Performance monitoring
- User analytics
