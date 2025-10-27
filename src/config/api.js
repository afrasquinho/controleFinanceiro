// Configuração da API MongoDB
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend-deploy.herokuapp.com' // Substitua pela URL do seu backend em produção
  : 'http://localhost:5000';

const API_ENDPOINTS = {
  // Autenticação
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    GOOGLE: '/api/auth/google',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  
  // Gastos
  GASTOS: {
    BASE: '/api/gastos',
    BY_ID: (id) => `/api/gastos/${id}`,
    BY_PERIOD: (mes, ano) => `/api/gastos/period/${mes}/${ano}`,
    BY_CATEGORY: (categoria) => `/api/gastos/category/${categoria}`,
    STATS: '/api/gastos/stats',
    SEARCH: '/api/gastos/search'
  },
  
  // Rendimentos
  RENDIMENTOS: {
    BASE: '/api/rendimentos',
    BY_ID: (id) => `/api/rendimentos/${id}`,
    BY_PERIOD: (mes, ano) => `/api/rendimentos/period/${mes}/${ano}`,
    STATS: '/api/rendimentos/stats'
  },
  
  // Analytics
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    TRENDS: '/api/analytics/trends',
    CATEGORIES: '/api/analytics/categories'
  }
};

// Classe para gerenciar requisições HTTP
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Definir token de autenticação
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Obter headers padrão
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Fazer requisição HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Métodos de autenticação
  async register(userData) {
    const response = await this.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async googleLogin(data) {
    const response = await this.post(API_ENDPOINTS.AUTH.GOOGLE, data);
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    const response = await this.post(API_ENDPOINTS.AUTH.LOGOUT);
    this.setToken(null);
    return response;
  }

  async getMe() {
    return this.get(API_ENDPOINTS.AUTH.ME);
  }

  // Métodos de gastos
  async getGastos(params = {}) {
    return this.get(API_ENDPOINTS.GASTOS.BASE, params);
  }

  async getGastoById(id) {
    return this.get(API_ENDPOINTS.GASTOS.BY_ID(id));
  }

  async createGasto(gastoData) {
    return this.post(API_ENDPOINTS.GASTOS.BASE, gastoData);
  }

  async updateGasto(id, gastoData) {
    return this.put(API_ENDPOINTS.GASTOS.BY_ID(id), gastoData);
  }

  async deleteGasto(id) {
    return this.delete(API_ENDPOINTS.GASTOS.BY_ID(id));
  }

  async getGastosByPeriod(mes, ano) {
    return this.get(API_ENDPOINTS.GASTOS.BY_PERIOD(mes, ano));
  }

  async getGastosByCategory(categoria, limit = 50) {
    return this.get(API_ENDPOINTS.GASTOS.BY_CATEGORY(categoria), { limit });
  }

  async getGastosStats(params = {}) {
    return this.get(API_ENDPOINTS.GASTOS.STATS, params);
  }

  async searchGastos(query, params = {}) {
    return this.get(API_ENDPOINTS.GASTOS.SEARCH, { q: query, ...params });
  }

  // Métodos de rendimentos
  async getRendimentos(params = {}) {
    return this.get(API_ENDPOINTS.RENDIMENTOS.BASE, params);
  }

  async getRendimentoById(id) {
    return this.get(API_ENDPOINTS.RENDIMENTOS.BY_ID(id));
  }

  async createRendimento(rendimentoData) {
    return this.post(API_ENDPOINTS.RENDIMENTOS.BASE, rendimentoData);
  }

  async updateRendimento(id, rendimentoData) {
    return this.put(API_ENDPOINTS.RENDIMENTOS.BY_ID(id), rendimentoData);
  }

  async deleteRendimento(id) {
    return this.delete(API_ENDPOINTS.RENDIMENTOS.BY_ID(id));
  }

  async getRendimentosByPeriod(mes, ano) {
    return this.get(API_ENDPOINTS.RENDIMENTOS.BY_PERIOD(mes, ano));
  }

  async getRendimentosStats(params = {}) {
    return this.get(API_ENDPOINTS.RENDIMENTOS.STATS, params);
  }

  // Métodos de analytics
  async getDashboard(params = {}) {
    return this.get(API_ENDPOINTS.ANALYTICS.DASHBOARD, params);
  }

  async getTrends(params = {}) {
    return this.get(API_ENDPOINTS.ANALYTICS.TRENDS, params);
  }

  async getCategories(params = {}) {
    return this.get(API_ENDPOINTS.ANALYTICS.CATEGORIES, params);
  }
}

// Instância singleton
const apiClient = new ApiClient();

export default apiClient;
export { API_BASE_URL, API_ENDPOINTS };
