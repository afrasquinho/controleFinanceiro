const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: function() {
      return !this.provider || this.provider === 'local';
    },
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Não incluir senha nas consultas por padrão
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    currency: {
      type: String,
      default: 'EUR',
      enum: ['EUR', 'USD', 'BRL', 'GBP']
    },
    language: {
      type: String,
      default: 'pt',
      enum: ['pt', 'en', 'es']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      budgetAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual para estatísticas do usuário
userSchema.virtual('stats', {
  ref: 'Gasto',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  // Só executa se a senha foi modificada e se o provider é local
  if (!this.isModified('password') || this.provider !== 'local') return next();
  
  // Hash da senha com custo 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para atualizar último login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Método para obter dados públicos do usuário
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
