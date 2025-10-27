const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');

// Inicializar cliente OAuth do Google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Gerar JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Usuário já existe com este email'
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password
    });

    // Gerar token
    const token = generateToken(user._id);

    // Remover senha da resposta
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Fazer login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuário e incluir senha
    const user = await User.findOne({ email }).select('+password');

    // Verificar se usuário existe e senha está correta
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Conta desativada. Entre em contato com o suporte.'
      });
    }

    // Atualizar último login
    await user.updateLastLogin();

    // Gerar token
    const token = generateToken(user._id);

    // Remover senha da resposta
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Fazer logout
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Em uma implementação mais robusta, você poderia:
    // 1. Adicionar o token a uma blacklist
    // 2. Invalidar refresh tokens
    // 3. Limpar cookies
    
    res.status(200).json({
      status: 'success',
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter dados do usuário atual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email } = req.body;

    // Verificar se email já existe (se foi alterado)
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar usuário
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Buscar usuário com senha
    const user = await User.findById(req.user._id).select('+password');

    // Verificar senha atual
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        status: 'error',
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Login com Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({
        status: 'error',
        message: 'Token do Google é obrigatório'
      });
    }

    // Verificar token do Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const {
      email,
      name,
      picture,
      sub: googleId
    } = ticket.getPayload();

    // Verificar se usuário já existe
    let user = await User.findOne({ email });

    if (user) {
      // Se usuário existe mas não tem provider Google, adicionar
      if (!user.provider || user.provider === 'local') {
        user.provider = 'google';
        user.providerId = googleId;
        user.avatar = picture;
        if (user.name !== name) {
          user.name = name;
        }
        await user.save();
      }
    } else {
      // Criar novo usuário com Google
      user = await User.create({
        name,
        email,
        provider: 'google',
        providerId: googleId,
        avatar: picture,
        emailVerified: true, // Google já verifica o email
        isActive: true
      });
    }

    // Atualizar último login
    await user.updateLastLogin();

    // Gerar token JWT
    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao autenticar com Google'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  googleLogin
};
