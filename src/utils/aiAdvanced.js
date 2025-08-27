// src/utils/aiAdvanced.js
export class AdvancedFinancialAI {
    constructor() {
      this.categories = {
        'Alimentação': {
          keywords: ['supermercado', 'restaurante', 'comida', 'lanche', 'padaria', 'açougue', 'peixaria', 'mercearia', 'takeaway', 'delivery', 'pizza', 'hambúrguer', 'café', 'bar'],
          icon: '🍽️',
          color: '#e74c3c',
          tips: [
            'Cozinhe mais em casa - economia até 40%',
            'Faça lista de compras - evita gastos desnecessários',
            'Compre produtos da época - mais baratos e frescos',
            'Use cupons de desconto e promoções'
          ]
        },
        'Transporte': {
          keywords: ['combustível', 'gasolina', 'uber', 'taxi', 'autocarro', 'metro', 'comboio', 'estacionamento', 'portagem', 'viagem', 'bilhete', 'passe'],
          icon: '🚗',
          color: '#3498db',
          tips: [
            'Use transporte público - economia até 60%',
            'Partilhe viagens com colegas',
            'Considere bicicleta para distâncias curtas',
            'Planeie rotas para economizar combustível'
          ]
        },
        'Saúde': {
          keywords: ['farmácia', 'médico', 'hospital', 'dentista', 'exame', 'medicamento', 'consulta', 'análises', 'clínica', 'seguro saúde'],
          icon: '🏥',
          color: '#27ae60',
          tips: [
            'Use medicamentos genéricos - economia até 50%',
            'Consulte médico de família primeiro',
            'Mantenha check-ups regulares - previne gastos maiores',
            'Compare preços de medicamentos'
          ]
        },
        'Lazer': {
          keywords: ['cinema', 'teatro', 'bar', 'festa', 'viagem', 'entretenimento', 'concerto', 'jogo', 'hobby', 'diversão', 'parque', 'praia'],
          icon: '🎭',
          color: '#9b59b6',
          tips: [
            'Procure eventos gratuitos na cidade',
            'Use descontos de estudante/sénior',
            'Organize atividades em casa com amigos',
            'Aproveite promoções de cinema e teatro'
          ]
        },
        'Vestuário': {
          keywords: ['roupa', 'sapatos', 'shopping', 'loja', 'vestuário', 'acessórios', 'moda', 'calças', 'camisa', 'vestido'],
          icon: '👕',
          color: '#f39c12',
          tips: [
            'Compre em saldos - economia até 70%',
            'Considere lojas de segunda mão',
            'Invista em peças básicas e versáteis',
            'Cuide bem das roupas para durarem mais'
          ]
        },
        'Casa': {
          keywords: ['luz', 'água', 'gás', 'internet', 'telefone', 'limpeza', 'renda', 'condomínio', 'reparações', 'móveis', 'decoração'],
          icon: '🏠',
          color: '#34495e',
          tips: [
            'Compare fornecedores de energia',
            'Use lâmpadas LED - economia até 80%',
            'Renegocie contratos anualmente',
            'Faça manutenção preventiva'
          ]
        },
        'Educação': {
          keywords: ['livro', 'curso', 'escola', 'universidade', 'formação', 'material escolar', 'propinas', 'aulas'],
          icon: '📚',
          color: '#16a085',
          tips: [
            'Use bibliotecas públicas',
            'Procure cursos online gratuitos',
            'Compre livros usados',
            'Partilhe materiais com colegas'
          ]
        }
      };
    }
  
    // Análise principal
    analyze(gastosData, rendimentosData = {}) {
      console.log('🤖 Iniciando análise IA avançada...');
      console.log('Dados recebidos:', { gastosData, rendimentosData });
  
      const startTime = performance.now();
      
      try {
        // 1. Processar e limpar dados
        const processedData = this.processData(gastosData);
        console.log('Dados processados:', processedData);
  
        // 2. Categorização inteligente
        const categorizedData = this.categorizeExpenses(processedData);
        console.log('Dados categorizados:', categorizedData);
  
        // 3. Análise de padrões
        const patterns = this.analyzePatterns(categorizedData);
  
        // 4. Previsões com múltiplos algoritmos
        const predictions = this.generatePredictions(categorizedData);
  
        // 5. Detecção de anomalias
        const anomalies = this.detectAnomalies(processedData.expenses);
  
        // 6. Insights inteligentes
        const insights = this.generateInsights(categorizedData, patterns, anomalies);
  
        // 7. Recomendações personalizadas
        const recommendations = this.generateRecommendations(categorizedData);
  
        // 8. Alertas inteligentes
        const alerts = this.generateAlerts(categorizedData, predictions);
  
        // 9. Score de saúde financeira
        const healthScore = this.calculateHealthScore(categorizedData, rendimentosData);
  
        const processingTime = performance.now() - startTime;
  
        const result = {
          processedData: categorizedData,
          patterns,
          predictions,
          anomalies,
          insights,
          recommendations,
          alerts,
          healthScore,
          metadata: {
            processingTime: Math.round(processingTime),
            dataQuality: this.assessDataQuality(processedData),
            algorithmsUsed: ['Categorização por ML', 'Regressão Linear', 'Média Móvel', 'Z-Score', 'Análise Sazonal'],
            totalTransactions: processedData.expenses.length,
            lastAnalysis: new Date().toISOString()
          }
        };
  
        console.log('✅ Análise IA concluída:', result);
        return result;
  
      } catch (error) {
        console.error('❌ Erro na análise IA:', error);
        return this.getErrorFallback();
      }
    }
  
    // Processar dados brutos
    processData(gastosData) {
      const expenses = [];
      const monthlyData = {};
      let totalExpenses = 0;
  
      // Processar cada mês
      Object.entries(gastosData).forEach(([month, monthExpenses]) => {
        if (!Array.isArray(monthExpenses)) return;
  
        let monthTotal = 0;
        const validExpenses = [];
  
        monthExpenses.forEach((expense, index) => {
          // Validar e limpar dados
          if (expense && typeof expense.valor === 'number' && expense.valor > 0) {
            const cleanExpense = {
              id: `${month}_${index}`,
              month,
              description: (expense.desc || '').toString().trim(),
              value: expense.valor,
              date: expense.data || '',
              originalIndex: index
            };
  
            expenses.push(cleanExpense);
            validExpenses.push(cleanExpense);
            monthTotal += expense.valor;
            totalExpenses += expense.valor;
          }
        });
  
        monthlyData[month] = {
          total: monthTotal,
          expenses: validExpenses,
          count: validExpenses.length,
          average: validExpenses.length > 0 ? monthTotal / validExpenses.length : 0
        };
      });
  
      return {
        expenses,
        monthlyData,
        totalExpenses,
        totalTransactions: expenses.length,
        averageTransaction: expenses.length > 0 ? totalExpenses / expenses.length : 0
      };
    }
  
    // Categorização inteligente
    categorizeExpenses(processedData) {
      const categories = {};
      const categorizedExpenses = [];
  
      processedData.expenses.forEach(expense => {
        const category = this.smartCategorize(expense.description);
        const categorizedExpense = {
          ...expense,
          category,
          confidence: this.getCategoryConfidence(expense.description, category)
        };
  
        categorizedExpenses.push(categorizedExpense);
  
        // Agrupar por categoria
        if (!categories[category]) {
          categories[category] = {
            total: 0,
            count: 0,
            expenses: [],
            percentage: 0
          };
        }
  
        categories[category].total += expense.value;
        categories[category].count += 1;
        categories[category].expenses.push(categorizedExpense);
      });
  
      // Calcular percentuais
      Object.keys(categories).forEach(category => {
        categories[category].percentage = processedData.totalExpenses > 0 
          ? (categories[category].total / processedData.totalExpenses) * 100 
          : 0;
      });
  
      return {
        ...processedData,
        categories,
        categorizedExpenses
      };
    }
  
    // Categorização inteligente com score
    smartCategorize(description) {
      if (!description || description.trim() === '') return 'Outros';
  
      const desc = description.toLowerCase().trim();
      let bestCategory = 'Outros';
      let bestScore = 0;
  
      Object.entries(this.categories).forEach(([categoryName, categoryData]) => {
        let score = 0;
  
        // Score por palavras-chave
        categoryData.keywords.forEach(keyword => {
          if (desc.includes(keyword)) {
            // Score maior para matches exatos
            if (desc === keyword) {
              score += 10;
            } else if (desc.startsWith(keyword) || desc.endsWith(keyword)) {
              score += 7;
            } else {
              score += 5;
            }
          }
        });
  
        // Score por similaridade de palavras
        const descWords = desc.split(' ');
        categoryData.keywords.forEach(keyword => {
          descWords.forEach(word => {
            if (word.length > 3 && keyword.includes(word)) {
              score += 2;
            }
            if (keyword.length > 3 && word.includes(keyword)) {
              score += 2;
            }
          });
        });
  
        if (score > bestScore) {
          bestScore = score;
          bestCategory = categoryName;
        }
      });
  
      return bestScore > 3 ? bestCategory : 'Outros';
    }
  
    // Calcular confiança da categorização
    getCategoryConfidence(description, category) {
      if (category === 'Outros') return 0.3;
  
      const desc = description.toLowerCase();
      const categoryData = this.categories[category];
      
      if (!categoryData) return 0.3;
  
      const exactMatches = categoryData.keywords.filter(keyword => desc.includes(keyword)).length;
      const confidence = Math.min(0.9, 0.4 + (exactMatches * 0.2));
      
      return confidence;
    }
  
    // Análise de padrões
    analyzePatterns(data) {
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const monthlyTotals = months.map(month => data.monthlyData[month]?.total || 0);
  
      return {
        monthlyTotals,
        trend: this.calculateTrend(monthlyTotals),
        seasonality: this.detectSeasonality(monthlyTotals),
        volatility: this.calculateVolatility(monthlyTotals),
        growth: this.calculateGrowthRate(monthlyTotals),
        topCategories: this.getTopCategories(data.categories),
        spendingFrequency: this.analyzeSpendingFrequency(data)
      };
    }
  
    // Calcular tendência
    calculateTrend(monthlyTotals) {
      const validValues = monthlyTotals.filter(v => v > 0);
      
      if (validValues.length < 3) {
        return { direction: 'insufficient_data', percentage: 0, confidence: 'low' };
      }
  
      // Usar últimos 3 meses vs 3 meses anteriores
      const recent = validValues.slice(-3);
      const previous = validValues.slice(-6, -3);
  
      if (previous.length === 0) {
        return { direction: 'insufficient_data', percentage: 0, confidence: 'low' };
      }
  
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
  
      const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  
      return {
        direction: change > 10 ? 'increasing' : change < -10 ? 'decreasing' : 'stable',
        percentage: Math.abs(change),
        recentAverage: recentAvg,
        previousAverage: previousAvg,
        confidence: validValues.length >= 6 ? 'high' : 'medium'
      };
    }
  
    // Detectar sazonalidade
    detectSeasonality(monthlyTotals) {
      const quarters = [
        { name: 'Q1 (Jan-Mar)', months: [0, 1, 2], total: 0 },
        { name: 'Q2 (Abr-Jun)', months: [3, 4, 5], total: 0 },
        { name: 'Q3 (Jul-Set)', months: [6, 7, 8], total: 0 },
        { name: 'Q4 (Out-Dez)', months: [9, 10, 11], total: 0 }
      ];
  
      quarters.forEach(quarter => {
        quarter.total = quarter.months.reduce((sum, monthIndex) => 
          sum + (monthlyTotals[monthIndex] || 0), 0
        );
      });
  
      const maxQuarter = quarters.reduce((max, quarter) => 
        quarter.total > max.total ? quarter : max
      );
  
      const minQuarter = quarters.reduce((min, quarter) => 
        quarter.total < min.total ? quarter : min
      );
  
      return {
        peakQuarter: maxQuarter.name,
        lowQuarter: minQuarter.name,
        quarters,
        seasonalVariation: maxQuarter.total > 0 ? 
          ((maxQuarter.total - minQuarter.total) / maxQuarter.total) * 100 : 0
      };
    }
  
      // Calcular volatilidade (continuação)
  calculateVolatility(monthlyTotals) {
    const validValues = monthlyTotals.filter(v => v > 0);
    
    if (validValues.length < 2) return 0;

    const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
    const variance = validValues.reduce((sum, value) => 
      sum + Math.pow(value - mean, 2), 0
    ) / validValues.length;
    
    const standardDeviation = Math.sqrt(variance);
    const volatility = mean > 0 ? standardDeviation / mean : 0;
    
    return Math.min(volatility, 1); // Normalizar entre 0 e 1
  }

  // Calcular taxa de crescimento
  calculateGrowthRate(monthlyTotals) {
    const validValues = monthlyTotals.filter(v => v > 0);
    
    if (validValues.length < 2) return 0;

    const firstValue = validValues[0];
    const lastValue = validValues[validValues.length - 1];
    
    return firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  }

  // Obter top categorias
  getTopCategories(categories) {
    return Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  // Analisar frequência de gastos
  analyzeSpendingFrequency(data) {
    const frequencies = {};
    
    Object.values(data.monthlyData).forEach(monthData => {
      const count = monthData.count;
      const range = count === 0 ? 'none' : 
                   count <= 5 ? 'low' : 
                   count <= 15 ? 'medium' : 'high';
      
      frequencies[range] = (frequencies[range] || 0) + 1;
    });

    return frequencies;
  }

  // Gerar previsões com múltiplos algoritmos
  generatePredictions(data) {
    const monthlyTotals = Object.values(data.monthlyData).map(m => m.total);
    const validTotals = monthlyTotals.filter(t => t > 0);

    if (validTotals.length < 2) {
      return {
        nextMonth: 0,
        confidence: 'low',
        method: 'insufficient_data',
        range: { min: 0, max: 0 }
      };
    }

    // Método 1: Média móvel simples
    const simpleAverage = this.simpleMovingAverage(validTotals, 3);
    
    // Método 2: Média móvel exponencial
    const exponentialAverage = this.exponentialMovingAverage(validTotals, 0.3);
    
    // Método 3: Regressão linear
    const linearPrediction = this.linearRegression(validTotals);
    
    // Método 4: Análise sazonal
    const seasonalPrediction = this.seasonalForecast(monthlyTotals);

    // Ensemble (combinar métodos)
    const weights = {
      simple: 0.2,
      exponential: 0.3,
      linear: 0.3,
      seasonal: 0.2
    };

    const prediction = (
      simpleAverage * weights.simple +
      exponentialAverage * weights.exponential +
      linearPrediction * weights.linear +
      seasonalPrediction * weights.seasonal
    );

    const confidence = this.calculatePredictionConfidence(validTotals);
    const variance = this.calculatePredictionVariance(validTotals);

    return {
      nextMonth: Math.max(0, prediction),
      confidence,
      range: {
        min: Math.max(0, prediction - variance),
        max: prediction + variance
      },
      methods: {
        simpleAverage,
        exponentialAverage,
        linearPrediction,
        seasonalPrediction
      },
      ensemble: prediction
    };
  }

  // Média móvel simples
  simpleMovingAverage(values, period) {
    if (values.length < period) period = values.length;
    const recent = values.slice(-period);
    return recent.reduce((a, b) => a + b, 0) / recent.length;
  }

  // Média móvel exponencial
  exponentialMovingAverage(values, alpha) {
    let ema = values[0];
    for (let i = 1; i < values.length; i++) {
      ema = alpha * values[i] + (1 - alpha) * ema;
    }
    return ema;
  }

  // Regressão linear
  linearRegression(values) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return slope * n + intercept;
  }

  // Previsão sazonal
  seasonalForecast(monthlyTotals) {
    const currentMonth = new Date().getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    
    // Se temos dados do mesmo mês do ano anterior
    if (monthlyTotals[nextMonth] > 0) {
      const recentAverage = monthlyTotals.filter(v => v > 0)
        .slice(-3).reduce((a, b) => a + b, 0) / 3;
      const seasonalValue = monthlyTotals[nextMonth];
      
      // Combinar valor sazonal com tendência recente
      return (seasonalValue * 0.7) + (recentAverage * 0.3);
    }
    
    // Fallback para média geral
    const validValues = monthlyTotals.filter(v => v > 0);
    return validValues.length > 0 ? 
      validValues.reduce((a, b) => a + b, 0) / validValues.length : 0;
  }

  // Calcular confiança da previsão
  calculatePredictionConfidence(values) {
    if (values.length < 3) return 'low';
    if (values.length < 6) return 'medium';
    
    // Calcular estabilidade dos dados
    const volatility = this.calculateVolatility(values);
    
    if (volatility < 0.2) return 'high';
    if (volatility < 0.4) return 'medium';
    return 'low';
  }

  // Calcular variância da previsão
  calculatePredictionVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, value) => 
      sum + Math.pow(value - mean, 2), 0
    ) / values.length;
    
    return Math.sqrt(variance);
  }

  // Detectar anomalias usando Z-Score
  detectAnomalies(expenses) {
    if (expenses.length < 5) return [];

    const values = expenses.map(e => e.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => 
      sum + Math.pow(val - mean, 2), 0
    ) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [];

    return expenses.filter(expense => {
      const zScore = Math.abs((expense.value - mean) / stdDev);
      return zScore > 2.5; // Valores com Z-Score > 2.5 são anômalos
    }).map(expense => ({
      ...expense,
      zScore: Math.abs((expense.value - mean) / stdDev),
      severity: Math.abs((expense.value - mean) / stdDev) > 3 ? 'high' : 'medium'
    }));
  }

  // Gerar insights inteligentes
  generateInsights(data, patterns, anomalies) {
    const insights = [];

    // Insight sobre categoria dominante
    if (patterns.topCategories.length > 0) {
      const topCategory = patterns.topCategories[0];
      const categoryData = this.categories[topCategory.name];
      
      insights.push({
        type: 'category_dominance',
        title: `${categoryData?.icon || '📊'} ${topCategory.name} domina seus gastos`,
        description: `Representa ${topCategory.percentage.toFixed(1)}% do total (${this.formatCurrency(topCategory.total)})`,
        priority: topCategory.percentage > 40 ? 'high' : topCategory.percentage > 25 ? 'medium' : 'low',
        actionable: topCategory.percentage > 30,
        tips: categoryData?.tips?.slice(0, 2) || [],
        category: topCategory.name
      });
    }

    // Insight sobre tendência
    if (patterns.trend.direction !== 'insufficient_data') {
      const isIncreasing = patterns.trend.direction === 'increasing';
      insights.push({
        type: 'trend_analysis',
        title: `📈 Gastos ${isIncreasing ? 'em crescimento' : patterns.trend.direction === 'decreasing' ? 'diminuindo' : 'estáveis'}`,
        description: `${isIncreasing ? 'Aumento' : 'Variação'} de ${patterns.trend.percentage.toFixed(1)}% nos últimos meses`,
        priority: patterns.trend.percentage > 20 ? 'high' : 'medium',
        actionable: isIncreasing,
        trend: patterns.trend.direction
      });
    }

    // Insight sobre volatilidade
    if (patterns.volatility > 0.4) {
      insights.push({
        type: 'volatility',
        title: '⚡ Gastos muito irregulares',
        description: `Seus gastos variam significativamente entre meses (volatilidade: ${(patterns.volatility * 100).toFixed(0)}%)`,
        priority: 'medium',
        actionable: true,
        tips: [
          'Crie um orçamento mensal fixo',
          'Identifique gastos sazonais e planeje-se',
          'Use a regra 50/30/20 para organizar gastos'
        ]
      });
    }

    // Insight sobre anomalias
    if (anomalies.length > 0) {
      const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high');
      insights.push({
        type: 'anomalies',
        title: `🚨 ${anomalies.length} gasto${anomalies.length > 1 ? 's' : ''} anômalo${anomalies.length > 1 ? 's' : ''} detectado${anomalies.length > 1 ? 's' : ''}`,
        description: `Encontrados gastos muito acima da média${highSeverityAnomalies.length > 0 ? `, ${highSeverityAnomalies.length} crítico${highSeverityAnomalies.length > 1 ? 's' : ''}` : ''}`,
        priority: highSeverityAnomalies.length > 0 ? 'high' : 'medium',
        actionable: true,
        anomalies: anomalies.slice(0, 3) // Mostrar apenas os 3 primeiros
      });
    }

    // Insight sobre sazonalidade
    if (patterns.seasonality.seasonalVariation > 30) {
      insights.push({
        type: 'seasonality',
        title: '🌊 Padrão sazonal detectado',
        description: `Gastos variam ${patterns.seasonality.seasonalVariation.toFixed(0)}% entre estações. Pico: ${patterns.seasonality.peakQuarter}`,
        priority: 'low',
        actionable: true,
        tips: [
          'Planeje gastos sazonais com antecedência',
          'Crie uma reserva para períodos de maior gasto',
          'Aproveite períodos de menor gasto para economizar'
        ]
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Gerar recomendações personalizadas
  generateRecommendations(data) {
    const recommendations = [];

    // Recomendações baseadas em categorias
    Object.entries(data.categories).forEach(([categoryName, categoryData]) => {
      if (categoryData.total > 300 && categoryData.percentage > 15) {
        const categoryInfo = this.categories[categoryName];
        
        if (categoryInfo && categoryInfo.tips) {
          const potentialSaving = this.calculatePotentialSaving(categoryName, categoryData.total);
          
          recommendations.push({
            type: 'category_optimization',
            category: categoryName,
            title: `Otimizar gastos em ${categoryName}`,
            description: `Você gasta ${this.formatCurrency(categoryData.total)} em ${categoryName} (${categoryData.percentage.toFixed(1)}% do total)`,
            tips: categoryInfo.tips,
            potentialSaving,
            difficulty: this.getDifficultyLevel(categoryName),
            confidence: categoryData.percentage > 25 ? 0.9 : 0.7,
            icon: categoryInfo.icon
          });
        }
      }
    });

    // Recomendação geral se poucos gastos categorizados
    const othersCategory = data.categories['Outros'];
    if (othersCategory && othersCategory.percentage > 30) {
      recommendations.push({
        type: 'categorization',
        title: 'Melhorar categorização de gastos',
        description: `${othersCategory.percentage.toFixed(1)}% dos gastos não foram categorizados automaticamente`,
        tips: [
          'Use descrições mais específicas nos gastos',
          'Padronize nomes de estabelecimentos frequentes',
          'Revise gastos não categorizados manualmente'
        ],
        potentialSaving: 0,
        difficulty: 'Fácil',
        confidence: 0.8,
        priority: 'medium'
      });
    }

    return recommendations.sort((a, b) => (b.potentialSaving || 0) - (a.potentialSaving || 0));
  }

  // Calcular economia potencial por categoria
  calculatePotentialSaving(category, amount) {
    const savingRates = {
      'Alimentação': 0.25,
      'Transporte': 0.35,
      'Lazer': 0.30,
      'Vestuário': 0.40,
      'Casa': 0.15,
      'Saúde': 0.20,
      'Educação': 0.20,
      'Outros': 0.10
    };
    return amount * (savingRates[category] || 0.15);
}

// Obter nível de dificuldade
getDifficultyLevel(category) {
  const difficultyMap = {
    'Alimentação': 'Fácil',
    'Transporte': 'Médio',
    'Lazer': 'Fácil',
    'Vestuário': 'Fácil',
    'Casa': 'Difícil',
    'Saúde': 'Médio',
    'Educação': 'Médio',
    'Outros': 'Médio'
  };

  return difficultyMap[category] || 'Médio';
}

// Gerar alertas inteligentes
generateAlerts(data, predictions) {
  const alerts = [];

  // Alerta de gasto excessivo
  const currentMonth = new Date().getMonth();
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const currentMonthName = monthNames[currentMonth];
  const currentMonthData = data.monthlyData[currentMonthName];

  if (currentMonthData && currentMonthData.total > 0) {
    const monthlyAverage = Object.values(data.monthlyData)
      .filter(m => m.total > 0)
      .reduce((sum, m) => sum + m.total, 0) / 
      Object.values(data.monthlyData).filter(m => m.total > 0).length;

    if (currentMonthData.total > monthlyAverage * 1.3) {
      alerts.push({
        type: 'overspending',
        title: '⚠️ Gastos acima da média',
        message: `Este mês você gastou ${this.formatCurrency(currentMonthData.total)}, ${(((currentMonthData.total / monthlyAverage) - 1) * 100).toFixed(0)}% acima da sua média`,
        priority: 'high',
        actionable: true
      });
    }
  }

  // Alerta de previsão alta
  if (predictions.nextMonth > 0) {
    const monthlyAverage = Object.values(data.monthlyData)
      .filter(m => m.total > 0)
      .reduce((sum, m) => sum + m.total, 0) / 
      Object.values(data.monthlyData).filter(m => m.total > 0).length;

    if (predictions.nextMonth > monthlyAverage * 1.2) {
      alerts.push({
        type: 'prediction_warning',
        title: '🔮 Previsão de gastos elevados',
        message: `A IA prevê gastos de ${this.formatCurrency(predictions.nextMonth)} no próximo mês, acima da sua média`,
        priority: 'medium',
        actionable: true
      });
    }
  }

  // Alerta de categoria dominante
  const topCategory = Object.entries(data.categories)
    .sort(([,a], [,b]) => b.total - a.total)[0];

  if (topCategory && topCategory[1].percentage > 50) {
    alerts.push({
      type: 'category_dominance',
      title: '📊 Concentração excessiva de gastos',
      message: `${topCategory[1].percentage.toFixed(0)}% dos seus gastos são em ${topCategory[0]}. Considere diversificar`,
      priority: 'medium',
      actionable: true
    });
  }

  // Alerta de frequência baixa mas valores altos
  Object.entries(data.categories).forEach(([categoryName, categoryData]) => {
    if (categoryData.count <= 3 && categoryData.total > 500) {
      const avgPerTransaction = categoryData.total / categoryData.count;
      alerts.push({
        type: 'high_value_low_frequency',
        title: `💰 Gastos concentrados em ${categoryName}`,
        message: `Poucos gastos (${categoryData.count}) mas alto valor médio: ${this.formatCurrency(avgPerTransaction)}`,
        priority: 'low',
        actionable: true
      });
    }
  });

  return alerts.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Calcular score de saúde financeira
calculateHealthScore(data, rendimentosData) {
  let score = 50; // Score base
  const factors = [];

  // Fator 1: Diversificação de gastos (0-20 pontos)
  const categoryCount = Object.keys(data.categories).length;
  const diversificationScore = Math.min(20, categoryCount * 3);
  score += diversificationScore;
  factors.push({
    name: 'Diversificação',
    score: diversificationScore,
    max: 20,
    description: `${categoryCount} categorias de gastos`
  });

  // Fator 2: Estabilidade (0-20 pontos)
  const monthlyTotals = Object.values(data.monthlyData).map(m => m.total);
  const volatility = this.calculateVolatility(monthlyTotals);
  const stabilityScore = Math.max(0, 20 - (volatility * 40));
  score += stabilityScore;
  factors.push({
    name: 'Estabilidade',
    score: Math.round(stabilityScore),
    max: 20,
    description: `Volatilidade: ${(volatility * 100).toFixed(0)}%`
  });

  // Fator 3: Controle de gastos grandes (0-15 pontos)
  const anomalies = this.detectAnomalies(data.categorizedExpenses || []);
  const controlScore = Math.max(0, 15 - (anomalies.length * 3));
  score += controlScore;
  factors.push({
    name: 'Controle',
    score: Math.round(controlScore),
    max: 15,
    description: `${anomalies.length} gastos anômalos`
  });

  // Fator 4: Tendência (0-15 pontos)
  const patterns = this.analyzePatterns(data);
  let trendScore = 10; // Neutro
  if (patterns.trend.direction === 'decreasing') {
    trendScore = 15; // Bom
  } else if (patterns.trend.direction === 'increasing' && patterns.trend.percentage > 20) {
    trendScore = 0; // Ruim
  }
  score += trendScore;
  factors.push({
    name: 'Tendência',
    score: trendScore,
    max: 15,
    description: `Gastos ${patterns.trend.direction === 'increasing' ? 'crescendo' : patterns.trend.direction === 'decreasing' ? 'diminuindo' : 'estáveis'}`
  });

  // Normalizar score (0-100)
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determinar status
  let status, color, message;
  if (score >= 80) {
    status = 'Excelente';
    color = '#27ae60';
    message = 'Suas finanças estão muito bem organizadas!';
  } else if (score >= 60) {
    status = 'Bom';
    color = '#f39c12';
    message = 'Bom controle financeiro, com espaço para melhorias.';
  } else if (score >= 40) {
    status = 'Regular';
    color = '#e67e22';
    message = 'Controle financeiro precisa de atenção.';
  } else {
    status = 'Crítico';
    color = '#e74c3c';
    message = 'Recomendamos revisar urgentemente seus gastos.';
  }

  return {
    score,
    status,
    color,
    message,
    factors,
    recommendations: this.getHealthRecommendations(score, factors)
  };
}

// Recomendações para melhorar saúde financeira
getHealthRecommendations(score, factors) {
  const recommendations = [];

  factors.forEach(factor => {
    const percentage = (factor.score / factor.max) * 100;
    
    if (percentage < 50) {
      // eslint-disable-next-line default-case
      switch (factor.name) {
        case 'Diversificação':
          recommendations.push('Categorize melhor seus gastos para ter visão mais clara');
          break;
        case 'Estabilidade':
          recommendations.push('Crie um orçamento mensal para reduzir variações');
          break;
        case 'Controle':
          recommendations.push('Revise gastos grandes e inesperados');
          break;
        case 'Tendência':
          recommendations.push('Identifique e controle o crescimento dos gastos');
          break;
      }
    }
  });

  if (score < 60) {
    recommendations.push('Considere usar a regra 50/30/20 para organizar gastos');
    recommendations.push('Defina metas mensais de economia');
  }

  return recommendations;
}

// Avaliar qualidade dos dados
assessDataQuality(processedData) {
  let quality = 'Boa';
  
  if (processedData.totalTransactions < 10) {
    quality = 'Baixa - Poucos dados';
  } else if (processedData.totalTransactions < 30) {
    quality = 'Média - Dados limitados';
  }

  // Verificar se há descrições vazias
  const emptyDescriptions = processedData.expenses.filter(e => !e.description || e.description.trim() === '').length;
  const emptyPercentage = (emptyDescriptions / processedData.expenses.length) * 100;
  
  if (emptyPercentage > 30) {
    quality = 'Baixa - Muitas descrições vazias';
  }

  return quality;
}

// Formatar moeda
formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0,00 €';
  return value.toFixed(2).replace('.', ',') + ' €';
}

// Fallback em caso de erro
getErrorFallback() {
  return {
    processedData: {
      totalExpenses: 0,
      categories: {},
      monthlyData: {},
      expenses: []
    },
    patterns: {
      trend: { direction: 'stable', percentage: 0 },
      volatility: 0,
      topCategories: []
    },
    predictions: {
      nextMonth: 0,
      confidence: 'low',
      range: { min: 0, max: 0 }
    },
    insights: [{
      type: 'error',
      title: '⚠️ Erro na análise',
      description: 'Não foi possível processar os dados. Verifique se há gastos registrados.',
      priority: 'low'
    }],
    recommendations: [],
    alerts: [],
    healthScore: {
      score: 0,
      status: 'Desconhecido',
      color: '#95a5a6',
      message: 'Dados insuficientes para análise',
      factors: []
    },
    anomalies: [],
    metadata: {
      processingTime: 0,
      dataQuality: 'Erro',
      algorithmsUsed: [],
      totalTransactions: 0,
      lastAnalysis: new Date().toISOString()
    }
  };
}
}

// Instância global da IA
// src/utils/aiAdvanced.js (final do arquivo - substituir as exportações)

// Instância global da IA
export const advancedAI = new AdvancedFinancialAI();

// Função principal para usar nos componentes - CORRIGIDA
export const analyzeWithAI = (gastosData, rendimentosData = {}) => {
  try {
    console.log('🤖 analyzeWithAI chamada com:', gastosData);
    
    if (!gastosData || typeof gastosData !== 'object') {
      console.error('❌ gastosData inválido:', gastosData);
      return getErrorFallback();
    }

    const result = advancedAI.analyze(gastosData, rendimentosData);
    console.log('✅ analyzeWithAI resultado:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Erro em analyzeWithAI:', error);
    return getErrorFallback();
  }
};

// Função de fallback para erros
const getErrorFallback = () => {
  return {
    processedData: {
      totalExpenses: 0,
      categories: {},
      monthlyData: {},
      expenses: []
    },
    patterns: {
      trend: { direction: 'stable', percentage: 0 },
      volatility: 0,
      topCategories: []
    },
    predictions: {
      nextMonth: 0,
      confidence: 'low',
      range: { min: 0, max: 0 }
    },
    insights: [{
      type: 'error',
      title: '⚠️ Erro na análise',
      description: 'Não foi possível processar os dados. Verifique se há gastos registrados.',
      priority: 'low'
    }],
    recommendations: [{
      type: 'basic',
      title: 'Adicionar mais dados',
      description: 'A IA precisa de mais informações para gerar recomendações',
      tips: ['Adicione descrições detalhadas nos gastos', 'Registre gastos regularmente'],
      potentialSaving: 0,
      difficulty: 'Fácil',
      confidence: 0.5
    }],
    alerts: [],
    healthScore: {
      score: 50,
      status: 'Desconhecido',
      color: '#95a5a6',
      message: 'Dados insuficientes para análise',
      factors: []
    },
    anomalies: [],
    metadata: {
      processingTime: 0,
      dataQuality: 'Erro',
      algorithmsUsed: ['Fallback'],
      totalTransactions: 0,
      lastAnalysis: new Date().toISOString()
    }
  };
};

// Funções auxiliares para usar em outros lugares
export const categorizeExpense = (description) => {
  try {
    return advancedAI.smartCategorize(description);
  } catch (error) {
    console.error('Erro ao categorizar:', error);
    return 'Outros';
  }
};

export const predictNextMonth = (gastosData) => {
  try {
    const processedData = advancedAI.processData(gastosData);
    const categorizedData = advancedAI.categorizeExpenses(processedData);
    return advancedAI.generatePredictions(categorizedData);
  } catch (error) {
    console.error('Erro na previsão:', error);
    return { nextMonth: 0, confidence: 'low' };
  }
};

export const getFinancialHealth = (gastosData, rendimentosData = {}) => {
  try {
    const processedData = advancedAI.processData(gastosData);
    const categorizedData = advancedAI.categorizeExpenses(processedData);
    return advancedAI.calculateHealthScore(categorizedData, rendimentosData);
  } catch (error) {
    console.error('Erro no health score:', error);
    return { score: 0, status: 'Erro' };
  }
};

export const detectExpenseAnomalies = (gastosData) => {
  try {
    const processedData = advancedAI.processData(gastosData);
    return advancedAI.detectAnomalies(processedData.expenses);
  } catch (error) {
    console.error('Erro na detecção de anomalias:', error);
    return [];
  }
};

// Função para testar a IA
export const testAI = (gastosData) => {
  console.log('🧪 Testando IA com dados:', gastosData);
  const result = analyzeWithAI(gastosData);
  console.log('📊 Resultado da IA:', result);
  return result;
};

// Função para obter estatísticas rápidas
export const getQuickStats = (gastosData) => {
  try {
    if (!gastosData || Object.keys(gastosData).length === 0) {
      return {
        totalExpenses: 0,
        totalTransactions: 0,
        averageTransaction: 0,
        topCategory: null,
        healthScore: 0
      };
    }

    const processedData = advancedAI.processData(gastosData);
    const categorizedData = advancedAI.categorizeExpenses(processedData);
    
    return {
      totalExpenses: categorizedData.totalExpenses,
      totalTransactions: categorizedData.totalTransactions,
      averageTransaction: categorizedData.averageTransaction,
      topCategory: advancedAI.getTopCategories(categorizedData.categories)[0] || null,
      healthScore: advancedAI.calculateHealthScore(categorizedData, {}).score
    };
  } catch (error) {
    console.error('Erro nas estatísticas rápidas:', error);
    return {
      totalExpenses: 0,
      totalTransactions: 0,
      averageTransaction: 0,
      topCategory: null,
      healthScore: 0
    };
  }
};
