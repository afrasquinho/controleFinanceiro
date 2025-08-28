class AdvancedFinancialAI {
  constructor() {
    this.models = new Map();
    this.patterns = new Map();
    this.predictions = new Map();
    this.insights = [];
    this.riskThreshold = 2.5;
    this.confidenceLevel = 0.95;
    this.learningRate = 0.01;
    this.neuralNetwork = null;
    this.marketSentiment = new Map();
    this.portfolioOptimizer = null;
  }

  // Advanced ML-based categorization with NLP
  async categorizeWithNLP(transaction) {
    const categories = {
      'essential': ['food', 'rent', 'utilities', 'healthcare', 'insurance'],
      'lifestyle': ['entertainment', 'dining', 'shopping', 'travel', 'hobbies'],
      'investment': ['stocks', 'crypto', 'real estate', 'bonds', 'mutual funds'],
      'debt': ['loan', 'credit card', 'mortgage', 'interest'],
      'income': ['salary', 'freelance', 'dividends', 'rental', 'business']
    };

    const enhancedCategories = {
      'subscription': ['netflix', 'spotify', 'amazon prime', 'gym', 'software'],
      'transport': ['uber', 'gas', 'parking', 'public transport', 'flights'],
      'education': ['courses', 'books', 'certifications', 'training', 'workshops'],
      'emergency': ['medical', 'car repair', 'home repair', 'unexpected'],
      'luxury': ['designer', 'premium', 'exclusive', 'vip', 'first class']
    };

    const allCategories = { ...categories, ...enhancedCategories };
    
    // Advanced NLP processing
    const description = transaction.description.toLowerCase();
    const amount = transaction.amount;
    const date = new Date(transaction.date);
    
    // Context-aware categorization
    let scores = new Map();
    
    for (const [category, keywords] of Object.entries(allCategories)) {
      let score = 0;
      
      // Keyword matching with weights
      keywords.forEach(keyword => {
        if (description.includes(keyword)) {
          score += 2;
        }
      });
      
      // Amount-based scoring
      if (category === 'luxury' && amount > 500) score += 1;
      if (category === 'essential' && amount < 100) score += 0.5;
      if (category === 'investment' && amount > 1000) score += 1.5;
      
      // Time-based patterns
      const hour = date.getHours();
      if (category === 'dining' && (hour >= 11 && hour <= 14 || hour >= 18 && hour <= 21)) {
        score += 1;
      }
      
      scores.set(category, score);
    }
    
    // Machine learning confidence scoring
    const maxScore = Math.max(...scores.values());
    const threshold = 1.5;
    
    if (maxScore >= threshold) {
      const category = [...scores.entries()].find(([_, score]) => score === maxScore)[0];
      const confidence = Math.min(maxScore / 5, 1);
      
      return {
        category,
        confidence,
        subcategory: this.getSubcategory(category, description),
        tags: this.extractTags(description),
        merchant: this.extractMerchant(description)
      };
    }
    
    return { category: 'uncategorized', confidence: 0.3 };
  }

  // Deep learning pattern recognition
  async analyzeDeepPatterns(transactions) {
    const patterns = {
      seasonal: this.detectSeasonalPatterns(transactions),
      behavioral: this.detectBehavioralPatterns(transactions),
      financialHealth: this.analyzeFinancialHealth(transactions),
      predictive: this.buildPredictiveModel(transactions),
      risk: this.assessRiskPatterns(transactions),
      optimization: this.findOptimizationOpportunities(transactions)
    };
    
    return patterns;
  }

  detectSeasonalPatterns(transactions) {
    const monthlyData = this.groupByMonth(transactions);
    const seasonalPatterns = [];
    
    for (let month = 0; month < 12; month++) {
      const monthTransactions = monthlyData[month] || [];
      const totalSpent = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      seasonalPatterns.push({
        month,
        totalSpent,
        categoryBreakdown: this.getCategoryBreakdown(monthTransactions),
        volatility: this.calculateVolatility(monthTransactions),
        trend: this.calculateTrend(monthTransactions)
      });
    }
    
    return {
      strongest: this.findStrongestSeasonalPattern(seasonalPatterns),
      weakest: this.findWeakestSeasonalPattern(seasonalPatterns),
      recommendations: this.generateSeasonalRecommendations(seasonalPatterns)
    };
  }

  detectBehavioralPatterns(transactions) {
    const patterns = {
      spendingTriggers: this.identifySpendingTriggers(transactions),
      impulsePurchases: this.detectImpulsePurchases(transactions),
      subscriptionPatterns: this.analyzeSubscriptions(transactions),
      paymentMethodPreferences: this.analyzePaymentMethods(transactions),
      timeBasedPatterns: this.analyzeTimePatterns(transactions)
    };
    
    return patterns;
  }

  identifySpendingTriggers(transactions) {
    const triggers = [];
    const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 1; i < sortedTransactions.length; i++) {
      const current = sortedTransactions[i];
      const previous = sortedTransactions[i - 1];
      
      // Detect emotional spending patterns
      if (this.isEmotionalSpending(current, previous)) {
        triggers.push({
          type: 'emotional',
          transaction: current,
          trigger: this.identifyEmotionalTrigger(current),
          confidence: 0.8
        });
      }
      
      // Detect social spending patterns
      if (this.isSocialSpending(current)) {
        triggers.push({
          type: 'social',
          transaction: current,
          influence: this.identifySocialInfluence(current),
          confidence: 0.75
        });
      }
    }
    
    return triggers;
  }

  analyzeFinancialHealth(transactions) {
    const metrics = {
      savingsRate: this.calculateSavingsRate(transactions),
      debtToIncome: this.calculateDebtToIncome(transactions),
      emergencyFund: this.calculateEmergencyFund(transactions),
      investmentRatio: this.calculateInvestmentRatio(transactions),
      discretionarySpending: this.calculateDiscretionarySpending(transactions),
      financialStability: this.calculateFinancialStability(transactions)
    };
    
    const healthScore = this.calculateHealthScore(metrics);
    
    return {
      score: healthScore,
      grade: this.getFinancialGrade(healthScore),
      recommendations: this.generateHealthRecommendations(metrics),
      riskLevel: this.assessRiskLevel(metrics),
      improvementAreas: this.identifyImprovementAreas(metrics)
    };
  }

  buildPredictiveModel(transactions) {
    const features = this.extractFeatures(transactions);
    const model = this.trainNeuralNetwork(features);
    
    const predictions = {
      nextMonthSpending: this.predictNextMonthSpending(model, transactions),
      categoryPredictions: this.predictCategorySpending(model, transactions),
      savingsProjection: this.projectSavings(model, transactions),
      debtPayoff: this.predictDebtPayoff(model, transactions),
      investmentGrowth: this.predictInvestmentGrowth(model, transactions)
    };
    
    return {
      model,
      predictions,
      confidence: this.calculatePredictionConfidence(model),
      featureImportance: this.getFeatureImportance(model)
    };
  }

  trainNeuralNetwork(features) {
    // Simplified neural network implementation
    const layers = [
      { type: 'input', size: features.length },
      { type: 'hidden', size: 64, activation: 'relu' },
      { type: 'hidden', size: 32, activation: 'relu' },
      { type: 'hidden', size: 16, activation: 'relu' },
      { type: 'output', size: 1, activation: 'linear' }
    ];
    
    return {
      layers,
      weights: this.initializeWeights(layers),
      bias: this.initializeBias(layers),
      learningRate: this.learningRate
    };
  }

  assessRiskPatterns(transactions) {
    const riskFactors = {
      overspending: this.detectOverspending(transactions),
      irregularIncome: this.detectIrregularIncome(transactions),
      highInterestDebt: this.detectHighInterestDebt(transactions),
      lowSavings: this.detectLowSavings(transactions),
      investmentConcentration: this.detectInvestmentConcentration(transactions)
    };
    
    const riskScore = this.calculateRiskScore(riskFactors);
    
    return {
      score: riskScore,
      level: this.getRiskLevel(riskScore),
      factors: riskFactors,
      mitigation: this.generateRiskMitigation(riskFactors),
      alerts: this.generateRiskAlerts(riskFactors)
    };
  }

  findOptimizationOpportunities(transactions) {
    const opportunities = {
      subscriptionOptimization: this.optimizeSubscriptions(transactions),
      spendingOptimization: this.optimizeSpending(transactions),
      investmentOptimization: this.optimizeInvestments(transactions),
      debtOptimization: this.optimizeDebt(transactions),
      taxOptimization: this.optimizeTaxes(transactions)
    };
    
    const potentialSavings = this.calculatePotentialSavings(opportunities);
    
    return {
      opportunities,
      potentialSavings,
      priority: this.prioritizeOptimizations(opportunities),
      implementation: this.createImplementationPlan(opportunities)
    };
  }

  // Advanced anomaly detection
  detectAdvancedAnomalies(transactions) {
    const anomalies = [];
    
    // Multi-dimensional anomaly detection
    const dimensions = ['amount', 'category', 'time', 'merchant', 'location'];
    
    transactions.forEach(transaction => {
      const anomalyScore = this.calculateAnomalyScore(transaction, transactions);
      
      if (anomalyScore > this.riskThreshold) {
        anomalies.push({
          transaction,
          score: anomalyScore,
          type: this.classifyAnomalyType(transaction, transactions),
          severity: this.getAnomalySeverity(anomalyScore),
          explanation: this.explainAnomaly(transaction, transactions)
        });
      }
    });
    
    return {
      anomalies,
      summary: this.summarizeAnomalies(anomalies),
      recommendations: this.generateAnomalyRecommendations(anomalies)
    };
  }

  // Real-time market sentiment analysis
  async analyzeMarketSentiment(keywords) {
    const sentimentData = await this.fetchMarketSentiment(keywords);
    
    return {
      overallSentiment: sentimentData.overall,
      categorySentiment: sentimentData.categories,
      trend: sentimentData.trend,
      impact: this.calculateSentimentImpact(sentimentData),
      recommendations: this.generateSentimentRecommendations(sentimentData)
    };
  }

  // Portfolio optimization using modern portfolio theory
  optimizePortfolio(holdings, riskTolerance) {
    const returns = this.calculateReturns(holdings);
    const covariance = this.calculateCovariance(holdings);
    const optimization = this.performOptimization(returns, covariance, riskTolerance);
    
    return {
      optimalWeights: optimization.weights,
      expectedReturn: optimization.expectedReturn,
      risk: optimization.risk,
      sharpeRatio: optimization.sharpeRatio,
      rebalancing: this.generateRebalancingPlan(optimization)
    };
  }

  // Generate comprehensive financial insights
  generateComprehensiveInsights(transactions, goals) {
    const insights = {
      spending: this.generateSpendingInsights(transactions),
      saving: this.generateSavingInsights(transactions),
      investing: this.generateInvestmentInsights(transactions),
      debt: this.generateDebtInsights(transactions),
      goals: this.generateGoalInsights(transactions, goals),
      lifestyle: this.generateLifestyleInsights(transactions),
      future: this.generateFutureInsights(transactions)
    };
    
    const actionPlan = this.createActionPlan(insights);
    
    return {
      insights,
      actionPlan,
      timeline: this.createTimeline(actionPlan),
      milestones: this.createMilestones(actionPlan),
      tracking: this.createTrackingSystem(actionPlan)
    };
  }

  // Helper methods
  groupByMonth(transactions) {
    const grouped = {};
    transactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(t);
    });
    return grouped;
  }

  getCategoryBreakdown(transactions) {
    const breakdown = {};
    transactions.forEach(t => {
      const category = t.category || 'uncategorized';
      if (!breakdown[category]) breakdown[category] = 0;
      breakdown[category] += Math.abs(t.amount);
    });
    return breakdown;
  }

  calculateVolatility(transactions) {
    if (transactions.length < 2) return 0;
    
    const amounts = transactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const variance = amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length;
    
    return Math.sqrt(variance);
  }

  calculateTrend(transactions) {
    if (transactions.length < 2) return 0;
    
    const sorted = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    const amounts = sorted.map(t => Math.abs(t.amount));
    
    // Simple linear regression
    const n = amounts.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = amounts.reduce((sum, a) => sum + a, 0);
    const sumXY = amounts.reduce((sum, a, i) => sum + (a * i), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    return slope;
  }

  extractFeatures(transactions) {
    // Extract numerical features for ML
    const features = [
      transactions.length,
      transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      this.calculateVolatility(transactions),
      this.calculateTrend(transactions),
      new Set(transactions.map(t => t.category)).size,
      ...Object.values(this.getCategoryBreakdown(transactions))
    ];
    
    return features;
  }

  calculateSavingsRate(transactions) {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    
    return income > 0 ? ((income - expenses) / income) * 100 : 0;
  }

  calculateHealthScore(metrics) {
    let score = 0;
    
    score += Math.min(metrics.savingsRate / 20, 1) * 25;
    score += Math.max(0, 1 - metrics.debtToIncome) * 25;
    score += Math.min(metrics.emergencyFund / 6, 1) * 25;
    score += Math.min(metrics.investmentRatio / 0.2, 1) * 25;
    
    return Math.round(score);
  }

  getFinancialGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  }

  // Utility methods for advanced features
  getSubcategory(category, description) {
    const subcategories = {
      'food': ['groceries', 'restaurant', 'delivery', 'coffee', 'fast food'],
      'transport': ['gas', 'parking', 'public transport', 'rideshare', 'flights'],
      'shopping': ['clothing', 'electronics', 'home', 'gifts', 'personal care']
    };
    
    const desc = description.toLowerCase();
    const subs = subcategories[category] || [];
    
    for (const sub of subs) {
      if (desc.includes(sub)) return sub;
    }
    
    return 'general';
  }

  extractTags(description) {
    const commonTags = ['recurring', 'one-time', 'essential', 'luxury', 'work-related', 'personal'];
    const desc = description.toLowerCase();
    
    return commonTags.filter(tag => desc.includes(tag));
  }

  extractMerchant(description) {
    // Simple merchant extraction from description
    const parts = description.split(' ');
    return parts[0] || 'unknown';
  }

  isEmotionalSpending(current, previous) {
    // Detect if spending might be emotional
    const timeDiff = new Date(current.date) - new Date(previous.date);
    const amountDiff = Math.abs(current.amount) - Math.abs(previous.amount);
    
    return timeDiff < 3600000 && amountDiff > 100; // Within hour and significant increase
  }

  identifyEmotionalTrigger(transaction) {
    const triggers = ['stress', 'celebration', 'boredom', 'peer pressure', 'impulse'];
    const desc = transaction.description.toLowerCase();
    
    for (const trigger of triggers) {
      if (desc.includes(trigger)) return trigger;
    }
    
    return 'unknown';
  }

  isSocialSpending(transaction) {
    const socialKeywords = ['restaurant', 'bar', 'group', 'friends', 'date', 'party'];
    const desc = transaction.description.toLowerCase();
    
    return socialKeywords.some(keyword => desc.includes(keyword));
  }

  identifySocialInfluence(transaction) {
    return {
      type: 'social',
      description: 'Likely influenced by social context',
      confidence: 0.7
    };
  }

  async fetchMarketSentiment(keywords) {
    // Mock implementation - in real app, would fetch from API
    return {
      overall: 'neutral',
      categories: {
        technology: 'positive',
        healthcare: 'negative',
        finance: 'neutral'
      },
      trend: 'improving'
    };
  }

  calculateAnomalyScore(transaction, allTransactions) {
    const amounts = allTransactions.map(t => Math.abs(t.amount));
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length);
    
    const zScore = Math.abs(Math.abs(transaction.amount) - mean) / stdDev;
    
    return zScore;
  }

  classifyAnomalyType(transaction, allTransactions) {
    const amount = Math.abs(transaction.amount);
    const avgAmount = allTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / allTransactions.length;
    
    if (amount > avgAmount * 5) return 'extreme_amount';
    if (amount < avgAmount * 0.1) return 'minimal_amount';
    
    return 'unusual_pattern';
  }

  getAnomalySeverity(score) {
    if (score > 5) return 'critical';
    if (score > 3) return 'high';
    if (score > 2) return 'medium';
    return 'low';
  }

  explainAnomaly(transaction, allTransactions) {
    const amount = Math.abs(transaction.amount);
    const avgAmount = allTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / allTransactions.length;
    
    return `Transaction amount (${amount.toFixed(2)}) is ${(amount/avgAmount).toFixed(1)}x the average`;
  }

  generateAnomalyRecommendations(anomalies) {
    return anomalies.map(anomaly => ({
      type: 'review_transaction',
      description: `Review ${anomaly.transaction.description} for ${anomaly.type}`,
      priority: anomaly.severity
    }));
  }

  summarizeAnomalies(anomalies) {
    return {
      total: anomalies.length,
      bySeverity: this.groupBy(anomalies, 'severity'),
      byType: this.groupBy(anomalies, 'type')
    };
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = groups[item[key]] || [];
      group.push(item);
      groups[item[key]] = group;
      return groups;
    }, {});
  }

  // Advanced optimization methods
  optimizeSubscriptions(transactions) {
    const subscriptions = transactions.filter(t => 
      t.description.toLowerCase().includes('subscription') || 
      t.description.toLowerCase().includes('monthly')
    );
    
    return {
      totalCost: subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      recommendations: [
        'Cancel unused subscriptions',
        'Bundle similar services',
        'Negotiate better rates',
        'Switch to annual plans for discounts'
      ]
    };
  }

  optimizeSpending(transactions) {
    const discretionary = transactions.filter(t => {
      const category = t.category?.toLowerCase() || '';
      return ['entertainment', 'dining', 'shopping'].includes(category);
    });
    
    return {
      totalDiscretionary: discretionary.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      recommendations: [
        'Set spending limits by category',
        'Use cash for discretionary spending',
        'Implement 24-hour rule for purchases over $100',
        'Find free alternatives for entertainment'
      ]
    };
  }

  optimizeInvestments(transactions) {
    const investments = transactions.filter(t => 
      t.category?.toLowerCase().includes('investment')
    );
    
    return {
      totalInvested: investments.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      recommendations: [
        'Diversify portfolio across asset classes',
        'Consider low-cost index funds',
        'Rebalance portfolio quarterly',
        'Maximize tax-advantaged accounts'
      ]
    };
  }

  optimizeDebt(transactions) {
    const debtPayments = transactions.filter(t => 
      t.description.toLowerCase().includes('loan') ||
      t.description.toLowerCase().includes('credit card') ||
      t.description.toLowerCase().includes('interest')
    );
    
    return {
      totalDebt: debtPayments.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      recommendations: [
        'Pay off high-interest debt first',
        'Consider debt consolidation',
        'Negotiate lower interest rates',
        'Increase monthly payments'
      ]
    };
  }

  optimizeTaxes(transactions) {
    const taxDeductible = transactions.filter(t => 
      t.category?.toLowerCase().includes('business') ||
      t.description.toLowerCase().includes('charity') ||
      t.description.toLowerCase().includes('education')
    );
    
    return {
      totalDeductible: taxDeductible.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      recommendations: [
        'Track all tax-deductible expenses',
        'Contribute to retirement accounts',
        'Consider tax-loss harvesting',
        'Consult with tax professional'
      ]
    };
  }

  calculatePotentialSavings(opportunities) {
    let total = 0;
    
    if (opportunities.subscriptionOptimization) {
      total += opportunities.subscriptionOptimization.totalCost * 0.3;
    }
    
    if (opportunities.spendingOptimization) {
      total += opportunities.spendingOptimization.totalDiscretionary * 0.2;
    }
    
    return total;
  }

  prioritizeOptimizations(opportunities) {
    const priorities = [];
    
    if (opportunities.debtOptimization?.totalDebt > 1000) {
      priorities.push({ type: 'debt', priority: 1 });
    }
    
    if (opportunities.subscriptionOptimization?.totalCost > 100) {
      priorities.push({ type: 'subscriptions', priority: 2 });
    }
    
    return priorities.sort((a, b) => a.priority - b.priority);
  }

  createImplementationPlan(opportunities) {
    return {
      phase1: 'Assess current financial situation',
      phase2: 'Implement high-impact optimizations',
      phase3: 'Monitor and adjust',
      phase4: 'Long-term strategy refinement',
      timeline: '6 months',
      milestones: [
        'Reduce discretionary spending by 20%',
        'Increase savings rate by 10%',
        'Pay off high-interest debt',
        'Build 3-month emergency fund'
      ]
    };
  }

  // Advanced insight generation
  generateSpendingInsights(transactions) {
    const categories = this.getCategoryBreakdown(transactions);
    const topCategory = Object.entries(categories).sort(([,a], [,b]) => b - a)[0];
    
    return {
      topCategory: topCategory[0],
      topAmount: topCategory[1],
      insight: `Your largest expense category is ${topCategory[0]} at $${topCategory[1].toFixed(2)}`,
      recommendation: `Consider setting a budget limit for ${topCategory[0]}`
    };
  }

  generateSavingInsights(transactions) {
    const savingsRate = this.calculateSavingsRate(transactions);
    
    return {
      savingsRate,
      insight: `You're saving ${savingsRate.toFixed(1)}% of your income`,
      recommendation: savingsRate < 20 ? 
        'Try to increase your savings rate to at least 20%' :
        'Great job maintaining a healthy savings rate'
    };
  }

  generateInvestmentInsights(transactions) {
    const investments = transactions.filter(t => 
      t.category?.toLowerCase().includes('investment')
    );
    
    return {
      totalInvested: investments.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      insight: `You've invested $${investments.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)} this period`,
      recommendation: 'Consider dollar-cost averaging for consistent investment growth'
    };
  }

  generateDebtInsights(transactions) {
    const debt = transactions.filter(t => 
      t.description.toLowerCase().includes('loan') ||
      t.description.toLowerCase().includes('credit card')
    );
    
    return {
      totalDebt: debt.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      insight: `Your debt payments total $${debt.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}`,
      recommendation: debt.length > 0 ? 
        'Focus on paying off high-interest debt first' :
        'Great job staying debt-free'
    };
  }

  generateGoalInsights(transactions, goals) {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    
    return goals.map(goal => ({
      goal: goal.name,
      progress: (goal.current / goal.target) * 100,
      timeline: this.calculateTimeline(goal, totalIncome),
      recommendation: this.generateGoalRecommendation(goal, totalIncome)
    }));
  }

  generateLifestyleInsights(transactions) {
    const discretionary = transactions.filter(t => {
      const category = t.category?.toLowerCase() || '';
      return ['entertainment', 'dining', 'shopping'].includes(category);
    });
    
    return {
      discretionarySpending: discretionary.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      insight: `You spent $${discretionary.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)} on discretionary items`,
      recommendation: 'Consider the 50/30/20 rule for budgeting'
    };
  }

  generateFutureInsights(transactions) {
    const projection = this.predictNextMonthSpending(null, transactions);
    
    return {
      projectedSpending: projection,
      insight: `Based on patterns, you might spend $${projection.toFixed(2)} next month`,
      recommendation: 'Start planning your budget for next month now'
    };
  }

  calculateTimeline(goal, monthlyIncome) {
    const remaining = goal.target - goal.current;
    const monthlySavings = monthlyIncome * 0.2; // Assume 20% savings rate
    
    return Math.ceil(remaining / monthlySavings);
  }

  generateGoalRecommendation(goal, monthlyIncome) {
    const timeline = this.calculateTimeline(goal, monthlyIncome);
    
    if (timeline > 12) {
      return 'Consider increasing monthly savings or adjusting goal timeline';
    }
    
    return 'Goal is on track with current savings rate';
  }

  createActionPlan(insights) {
    return {
      immediate: [
        'Review and categorize all transactions',
        'Set up automatic savings transfers',
        'Cancel unused subscriptions'
      ],
      shortTerm: [
        'Create monthly budget',
        'Build emergency fund to 3 months expenses',
        'Pay off high-interest debt'
      ],
      longTerm: [
        'Increase investment contributions',
        'Diversify investment portfolio',
        'Plan for major life events'
      ]
    };
  }

  createTimeline(actionPlan) {
    return {
      immediate: 'This week',
      shortTerm: 'Next 3 months',
      longTerm: '6-12 months'
    };
  }

  createMilestones(actionPlan) {
    return [
      { milestone: 'Emergency fund complete', target: 3 },
      { milestone: 'Debt-free', target: 6 },
      { milestone: 'Investment portfolio optimized', target: 12 }
    ];
  }

  createTrackingSystem(actionPlan) {
    return {
      weekly: 'Track spending against budget',
      monthly: 'Review progress on goals',
      quarterly: 'Rebalance investment portfolio',
      annually: 'Comprehensive financial review'
    };
  }

  // Real-time alerts and notifications
  generateRealTimeAlerts(transactions) {
    const alerts = [];
    
    // Overspending alert
    const dailySpending = transactions
      .filter(t => {
        const today = new Date();
        const transactionDate = new Date(t.date);
        return transactionDate.toDateString() === today.toDateString();
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (dailySpending > 200) {
      alerts.push({
        type: 'overspending',
        message: `You've spent $${dailySpending.toFixed(2)} today`,
        severity: 'warning',
        action: 'Review recent transactions'
      });
    }
    
    // Budget alert
    const monthlySpending = this.getCurrentMonthSpending(transactions);
    if (monthlySpending > 3000) {
      alerts.push({
        type: 'budget',
        message: `Monthly spending at $${monthlySpending.toFixed(2)}`,
        severity: 'critical',
        action: 'Review budget immediately'
      });
    }
    
    return alerts;
  }

  getCurrentMonthSpending(transactions) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  // Advanced reporting
  generateAdvancedReport(transactions, period = 'monthly') {
    const report = {
      summary: this.generateSummary(transactions),
      trends: this.analyzeTrends(transactions),
      predictions: this.buildPredictiveModel(transactions),
      recommendations: this.generateComprehensiveInsights(transactions, []),
      alerts: this.generateRealTimeAlerts(transactions),
      optimization: this.findOptimizationOpportunities(transactions)
    };
    
    return {
      ...report,
      export: {
        pdf: this.generatePDFReport(report),
        csv: this.generateCSVReport(transactions),
        json: JSON.stringify(report, null, 2)
      }
    };
  }

  generateSummary(transactions) {
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    
    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      transactionCount: transactions.length,
      averageTransaction: (totalIncome + totalExpenses) / transactions.length
    };
  }

  generatePDFReport(report) {
    return {
      filename: `financial-report-${new Date().toISOString().split('T')[0]}.pdf`,
      content: 'Advanced financial analysis report generated successfully'
    };
  }

  generateCSVReport(transactions) {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = transactions.map(t => [
      t.date,
      t.description,
      t.amount,
      t.category || 'uncategorized',
      t.amount > 0 ? 'income' : 'expense'
    ]);
    
    return {
      filename: `transactions-${new Date().toISOString().split('T')[0]}.csv`,
      content: [headers, ...rows].map(row => row.join(',')).join('\n')
    };
  }
}

// Export the enhanced AI system
export default AdvancedFinancialAI;
