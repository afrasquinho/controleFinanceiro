const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
require('dotenv').config();

const connectDB = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gastoRoutes = require('./routes/gastos');
const rendimentoRoutes = require('./routes/rendimentos');
const analyticsRoutes = require('./routes/analytics');
const daysWorkedRoutes = require('./routes/daysWorked');
const fixedCostsRoutes = require('./routes/fixedCosts');

// Conectar ao MongoDB
connectDB();

const app = express();

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://controlefinanceiro-694b8.web.app',
    'https://controlefinanceiro-694b8.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize()); // Previne NoSQL injection
app.use(xss()); // Previne XSS attacks
app.use(hpp()); // Previne parameter pollution

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/rendimentos', rendimentoRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/days-worked', daysWorkedRoutes);
app.use('/api/fixed-costs', fixedCostsRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Rota ${req.originalUrl} não encontrada`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({
      status: 'error',
      message: 'Dados inválidos',
      errors: errors
    });
  }

  // Erro de duplicação do MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} já existe`
    });
  }

  // Erro de cast do MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'ID inválido'
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido'
    });
  }

  // Erro JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expirado'
    });
  }

  // Erro padrão
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

module.exports = app;
