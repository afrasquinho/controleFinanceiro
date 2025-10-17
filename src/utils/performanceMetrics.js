/**
 * @fileoverview Sistema de métricas de performance
 * Monitora performance da aplicação, Web Vitals e métricas customizadas
 */

// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Classe para gerenciar métricas de performance
 */
class PerformanceMetrics {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.initializeWebVitals();
      this.initializeCustomMetrics();
    }
  }

  /**
   * Gera ID único para sessão
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicializa monitoramento de Web Vitals
   */
  initializeWebVitals() {
    // Cumulative Layout Shift
    getCLS((metric) => {
      this.recordMetric('CLS', metric.value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // First Input Delay
    getFID((metric) => {
      this.recordMetric('FID', metric.value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.recordMetric('FCP', metric.value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Largest Contentful Paint
    getLCP((metric) => {
      this.recordMetric('LCP', metric.value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.recordMetric('TTFB', metric.value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Inicializa métricas customizadas
   */
  initializeCustomMetrics() {
    // Performance Observer para Navigation Timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry);
          }
        }
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);
    }

    // Observer para Resource Timing
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceMetrics(entry);
        }
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }

    // Monitorar mudanças de visibilidade
    document.addEventListener('visibilitychange', () => {
      this.recordMetric('visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now()
      });
    });

    // Monitorar erros JavaScript
    window.addEventListener('error', (event) => {
      this.recordError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Monitorar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });
  }

  /**
   * Registra métrica de navegação
   * @param {PerformanceNavigationTiming} entry
   */
  recordNavigationMetrics(entry) {
    const metrics = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      redirectTime: entry.redirectEnd - entry.redirectStart,
      dnsLookup: entry.domainLookupEnd - entry.domainLookupStart,
      tcpConnect: entry.connectEnd - entry.connectStart,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      totalTime: entry.loadEventEnd - entry.navigationStart
    };

    Object.entries(metrics).forEach(([key, value]) => {
      this.recordMetric(`nav_${key}`, value, {
        sessionId: this.sessionId,
        url: window.location.href,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Registra métricas de recursos
   * @param {PerformanceResourceTiming} entry
   */
  recordResourceMetrics(entry) {
    const resourceType = this.getResourceType(entry.name);
    
    this.recordMetric(`resource_${resourceType}`, {
      duration: entry.duration,
      size: entry.transferSize || 0,
      url: entry.name,
      initiatorType: entry.initiatorType
    });
  }

  /**
   * Determina tipo de recurso baseado na URL
   * @param {string} url
   * @returns {string}
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.jpeg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    if (url.includes('firebase') || url.includes('api')) return 'api';
    return 'other';
  }

  /**
   * Registra uma métrica customizada
   * @param {string} name - Nome da métrica
   * @param {number|object} value - Valor da métrica
   * @param {object} metadata - Metadados adicionais
   */
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...metadata
    };

    this.metrics.set(name, metric);
    
    // Enviar para analytics (se configurado)
    this.sendToAnalytics(metric);
    
    // Log em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Metric: ${name}`, metric);
    }
  }

  /**
   * Registra um erro
   * @param {string} type - Tipo do erro
   * @param {object} details - Detalhes do erro
   */
  recordError(type, details) {
    const error = {
      type,
      details,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.recordMetric('error', error);
  }

  /**
   * Mede tempo de execução de uma função
   * @param {string} name - Nome da operação
   * @param {Function} fn - Função para executar
   * @returns {Promise<any>} Resultado da função
   */
  async measureExecution(name, fn) {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      
      this.recordMetric(`execution_${name}`, endTime - startTime, {
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(`execution_${name}`, endTime - startTime, {
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Mede tempo de carregamento de componente
   * @param {string} componentName - Nome do componente
   * @param {Function} componentFn - Função de carregamento do componente
   */
  async measureComponentLoad(componentName, componentFn) {
    const startTime = performance.now();
    
    try {
      const component = await componentFn();
      const endTime = performance.now();
      
      this.recordMetric(`component_load_${componentName}`, endTime - startTime, {
        success: true,
        component: componentName
      });
      
      return component;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric(`component_load_${componentName}`, endTime - startTime, {
        success: false,
        error: error.message,
        component: componentName
      });
      
      throw error;
    }
  }

  /**
   * Envia métricas para sistema de analytics
   * @param {object} metric - Métrica para enviar
   */
  sendToAnalytics(metric) {
    // Implementar envio para Google Analytics, Mixpanel, etc.
    if (typeof window !== 'undefined' && typeof window.gtag !== 'undefined') {
      window.gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        session_id: metric.sessionId
      });
    }
  }

  /**
   * Obtém resumo das métricas
   * @returns {object} Resumo das métricas
   */
  getMetricsSummary() {
    const summary = {};
    
    for (const [name, metric] of this.metrics) {
      if (!summary[name]) {
        summary[name] = [];
      }
      summary[name].push(metric);
    }
    
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics: summary,
      totalMetrics: this.metrics.size
    };
  }

  /**
   * Limpa métricas antigas
   * @param {number} maxAge - Idade máxima em ms (padrão: 1 hora)
   */
  clearOldMetrics(maxAge = 60 * 60 * 1000) {
    const cutoff = Date.now() - maxAge;
    
    for (const [name, metric] of this.metrics) {
      if (metric.timestamp < cutoff) {
        this.metrics.delete(name);
      }
    }
  }

  /**
   * Desconecta observers
   */
  disconnect() {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

// Instância singleton
const performanceMetrics = new PerformanceMetrics();

// Exportar funções utilitárias
export const measureExecution = (name, fn) => 
  performanceMetrics.measureExecution(name, fn);

export const measureComponentLoad = (name, fn) => 
  performanceMetrics.measureComponentLoad(name, fn);

export const recordMetric = (name, value, metadata) => 
  performanceMetrics.recordMetric(name, value, metadata);

export const recordError = (type, details) => 
  performanceMetrics.recordError(type, details);

export const getMetricsSummary = () => 
  performanceMetrics.getMetricsSummary();

export const clearOldMetrics = (maxAge) => 
  performanceMetrics.clearOldMetrics(maxAge);

export default performanceMetrics;
