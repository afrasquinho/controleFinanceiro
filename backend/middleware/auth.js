const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token está no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar o usuário
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido. Usuário não encontrado.'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Usuário inativo.'
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expirado.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor.'
    });
  }
};

// Middleware para verificar roles (futuro)
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Você não tem permissão para executar esta ação.'
      });
    }
    next();
  };
};

// Middleware para verificar se é o próprio usuário
const checkOwnership = (req, res, next) => {
  if (req.user._id.toString() !== req.params.userId) {
    return res.status(403).json({
      status: 'error',
      message: 'Você só pode acessar seus próprios dados.'
    });
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  checkOwnership
};
