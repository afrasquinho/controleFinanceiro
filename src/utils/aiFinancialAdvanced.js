// src/utils/aiFinancialAdvanced.js

// Classe principal para análise financeira com IA
export class FinancialAI {
    constructor() {
      this.categories = {
        'Alimentação': {
          keywords: ['supermercado', 'restaurante', 'comida', 'lanche', 'padaria', 'açougue', 'peixaria', 'mercearia', 'takeaway', 'delivery'],
          icon: '🍽️',
          savingTips: [
            'Cozinhe mais em casa - economia até 40%',
            'Faça lista de compras - evita gastos desnecessários',
            'Compre produtos da época - mais baratos e frescos'
          ]
        },
        'Transporte': {
          keywords: ['combustível', 'gasolina', 'uber', 'taxi', 'autocarro', 'metro', 'comboio', 'estacionamento', 'portagem'],
          icon: '🚗',
          savingTips: [
            'Use transporte público - economia até 60%',
            'Partilhe viagens com colegas',
            'Considere bicicleta para distâncias curtas'
          ]
        },
        'Saúde': {
          keywords: ['farmácia', 'médico', 'hospital', 'dentista', 'exame', 'medicamento', 'consulta', 'análises'],
          icon: '🏥',
          savingTips: [
            'Use medicamentos genéricos - economia até 50%',
            'Consulte médico de família primeiro',
            'Mantenha check-ups regulares - previne gastos maiores'
          ]
        },
        'Lazer': {
          keywords: ['cinema', 'teatro', 'bar', 'festa', 'viagem', 'entretenimento', 'concerto', 'jogo', 'hobby'],
          icon: '🎭',
          savingTips: [
            'Procure eventos gratuitos na cidade',
            'Use descontos de estudante/sénior',
            'Organize atividades em casa com amigos'
          ]
        },
        'Vestuário': {
          keywords: ['roupa', 'sapatos', 'shopping', 'loja', 'vestuário', 'acessórios', 'moda'],
          icon: '👕',
          savingTips: [
            'Compre em saldos - economia até 70%',
            'Considere lojas de segunda mão',
            'Invista em peças básicas e versáteis'
          ]
        },
        'Casa': {
          keywords: ['luz', 'água', 'gás', 'internet', 'telefone', 'limpeza', 'renda', 'condomínio', 'reparações'],
          icon: '🏠',
          savingTips: [
            'Compare fornecedores de energia',
            'Use lâmpadas LED - economia até 80%',
            'Renegocie contratos anualmente'
          ]
        },
        'Educação': {
          keywords: ['livro', 'curso', 'escola', 'universidade', 'formação', 'material escolar'],
          icon: '📚',
          savingTips: [
            'Use bibliotecas públicas',
            'Procure cursos online gratuitos',
            'Compre livros usados'
          ]
        }
      };
    }
  
    // Análise completa dos dados financeiros
    analyzeFinances(gastosData, rendimentosData) {
      const startTime = Date.now();
      
      try {
        // 1. Processar e categorizar dados
        const processedData = this.processData(gastosData);
        
        // 2. Análise de padrões
        const patterns = this.analyzePatterns(processedData);
        
        // 3. Previsões com IA
        const predictions = this.generatePredictions(processedData);
        
        // 4. Insights inteligentes
        const insights = this.generateInsights(processedData, patterns);
        
        // 5. Recomendações personalizadas
        const recommendations = this.generateRecommendations(processedData);
        
        // 6. Alertas inteligentes
        const alerts = this.generateAlerts(processedData, predictions);
        
        // 7. Score de saúde financeira
        const healthScore = this.calculateFinancialHealth(processedData, rendimentosData);
  
        const processingTime = Date.now() - startTime;
  
        return {
          processedData,
          patterns,
          predictions,
          insights,
          recommendations,
          alerts,
          healthScore,
          metadata: {
            processingTime,
            dataQuality: this.assessDataQuality(processedData),
            lastAnalysis: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Erro na análise IA:', error);
        return this.getErrorFallback();
      }
    }
  
    // Processar e categorizar dados
    processData(gastosData) {
      const processed = {
        totalExpenses: 0,
        monthlyData: {},
        categories: {},
        trends: [],
        expenses: []
      };
  
      Object.entries(gastosData).forEach(([month, expenses]) => {
        if (!Array.isArray(expenses)) return;
  
        let monthTotal = 0;
        const monthCategories = {};
  
        expenses.forEach(expense => {
          if (!expense || typeof expense.valor !== 'number') return;
  
          const category = this.categorizeExpense(expense.desc || '');
          const processedExpense = {
            ...expense,
            category,
            month,
            confidence: this.getCategorizeConfidence(expense.desc, category)
          };
  
          processed.expenses.push(processedExpense);
          monthTotal += expense.valor;
          monthCategories[category] = (monthCategories[category] || 0) + expense.valor;
          processed.categories[category] = (processed.categories[category] || 0) + expense.valor;
        });
  
        processed.monthlyData[month] = {
          total: monthTotal,
          categories: monthCategories,
          count: expenses.length
        };
  
        processed.totalExpenses += monthTotal;
      });
  
      return processed;
    }
  
    // Categorizar despesa com IA
    categorizeExpense(description) {
      if (!description) return 'Outros';
  
      const desc = description.toLowerCase().trim();
      let bestMatch = 'Outros';
      let maxScore = 0;
  
      Object.entries(this.categories).forEach(([category, data]) => {
        const score = this.calculateCategoryScore(desc, data.keywords);
        if (score > maxScore) {
          maxScore = score;
          bestMatch = category;
        }
      });
  
      return maxScore > 0.3 ? bestMatch : 'Outros';
    }
  
    // Calcular score de categoria
    calculateCategoryScore(description, keywords) {
      let score = 0;
      const words = description.split(' ');
  
      keywords.forEach(keyword => {
        if (description.includes(keyword)) {
          // Pontuação maior para matches exatos
          score += keyword.length === description.length ? 1.0 : 0.7;
        } else {
          // Pontuação para matches parciais
          words.forEach(word => {
            if (word.includes(keyword) || keyword.includes(word)) {
              score += 0.3;
            }
          });
        }
      });
  
      return Math.min(score, 1.0);
    }
  
    // Analisar padrões
    analyzePatterns(data) {
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const monthlyTotals = months.map(month => data.monthlyData[month]?.total || 0);
      
      return {
        monthlyTotals,
        trend: this.calculateTrend(monthlyTotals),
        seasonality: this.detectSeasonality(monthlyTotals),
        volatility: this.calculateVolatility(monthlyTotals),
        growth: this.calculateGrowthRate(monthlyTotals),
        topCategories: this.getTopCategories(data.categories)
      };
    }
  
    // Gerar previsões
    generatePredictions(data) {
      const monthlyTotals = Object.values(data.monthlyData).map(m => m.total);
      
      if (monthlyTotals.length < 3) {
        return {
          nextMonth: 0,
          confidence: 'low',
          method: 'insufficient_data'
        };
      }
  
      // Usar diferentes métodos de previsão
      const simpleAverage = this.predictByAverage(monthlyTotals);
      const trendBased = this.predictByTrend(monthlyTotals);
      const seasonalAdjusted = this.predictBySeason(monthlyTotals);
  
      // Combinar previsões (ensemble)
      const prediction = (simpleAverage * 0.3 + trendBased * 0.4 + seasonalAdjusted * 0.3);
      
      return {
        nextMonth: Math.max(0, prediction),
        confidence: this.calculatePredictionConfidence(monthlyTotals),
        methods: {
          average: simpleAverage,
          trend: trendBased,
          seasonal: seasonalAdjusted
        },
        range: {
          min: prediction * 0.8,
          max: prediction * 1.2
        }
      };
    }
  
    // Gerar insights
    generateInsights(data, patterns) {
      const insights = [];
  
      // Insight sobre categoria dominante
      const topCategory = patterns.topCategories[0];
      if (topCategory) {
        const percentage = (topCategory.amount / data.totalExpenses) * 100;
        insights.push({
          type: 'category_dominance',
          title: `${this.categories[topCategory.name]?.icon || '📊'} ${topCategory.name} é sua categoria principal`,
          description: `Representa ${percentage.toFixed(1)}% dos gastos (${this.formatCurrency(topCategory.amount)})`,
          priority: percentage > 40 ? 'high' : percentage > 25 ? 'medium' : 'low',
          actionable: percentage > 30,
          tips: this.categories[topCategory.name]?.savingTips || []
        });
      }
  
      // Insight sobre tendência
      if (patterns.trend.direction !== 'stable') {
        insights.push({
          type: 'trend_analysis',
          title: `📈 Gastos ${patterns.trend.direction === 'increasing' ? 'crescendo' : 'diminuindo'}`,
          description: `Variação de ${patterns.trend.percentage.toFixed(1)}% nos últimos meses`,
          priority: Math.abs(patterns.trend.percentage) > 20 ? 'high' : 'medium',
          actionable: patterns.trend.direction === 'increasing'
        });
      }
  
      // Insight sobre volatilidade
      if (patterns.volatility > 0.3) {
        insights.push({
          type: 'volatility',
          title: '⚡ Gastos irregulares detectados',
          description: 'Seus gastos variam muito entre meses. Considere criar um orçamento mais estruturado.',
          priority: 'medium',
          actionable: true
        });
      }
  
      return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    }
  
    // Funções auxiliares
    calculateTrend(values) {
      if (values.length < 2) return { direction: 'stable', percentage: 0 };
  
      const recentValues = values.slice(-3).filter(v => v > 0);
      const olderValues = values.slice(-6, -3).filter(v => v > 0);
  
      if (recentValues.length === 0 || olderValues.length === 0) {
        return { direction: 'stable', percentage: 0 };
      }
  
      const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
  
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
      return {
        direction: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
        percentage: change,
        recentAvg,
        olderAvg
      };
    }
  
    formatCurrency(value) {
      return `${value.toFixed(2).replace('.', ',')}€`;
    }
  
    getErrorFallback() {
      return {
        processedData: { totalExpenses: 0, categories: {}, monthlyData: {} },
        patterns: {},
        predictions: { nextMonth: 0, confidence: 'low' },
        insights: [{
          type: 'error',
          title: '⚠️ Erro na análise',
          description: 'Não foi possível processar os dados. Tente novamente.',
          priority: 'low'
        }],
        recommendations: [],
        alerts: [],
        healthScore: { score: 0, status: 'unknown' }
      };
    }
  }
  
  // Instância global
  export const financialAI = new FinancialAI();
  
  // Função principal para usar no componente
  export const analyzeWithAI = (gastosData, rendimentosData) => {
    return financialAI.analyzeFinances(gastosData, rendimentosData);
  };