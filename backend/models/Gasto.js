const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [200, 'Descrição não pode ter mais de 200 caracteres']
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor não pode ser negativo'],
    max: [1000000, 'Valor não pode exceder 1.000.000']
  },
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: {
      values: [
        'alimentacao',
        'transporte', 
        'saude',
        'educacao',
        'lazer',
        'casa',
        'vestuario',
        'outros'
      ],
      message: 'Categoria inválida'
    }
  },
  subcategoria: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategoria não pode ter mais de 50 caracteres']
  },
  data: {
    type: Date,
    required: [true, 'Data é obrigatória'],
    default: Date.now
  },
  mes: {
    type: String,
    required: [true, 'Mês é obrigatório'],
    enum: {
      values: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
      message: 'Mês inválido'
    }
  },
  ano: {
    type: Number,
    required: [true, 'Ano é obrigatório'],
    min: [2020, 'Ano deve ser maior que 2020'],
    max: [2030, 'Ano deve ser menor que 2030']
  },
  tipo: {
    type: String,
    enum: ['variavel', 'fixo'],
    default: 'variavel'
  },
  recorrente: {
    type: Boolean,
    default: false
  },
  recorrencia: {
    tipo: {
      type: String,
      enum: ['mensal', 'semanal', 'anual'],
      default: 'mensal'
    },
    dia: {
      type: Number,
      min: 1,
      max: 31
    },
    ativo: {
      type: Boolean,
      default: true
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag não pode ter mais de 20 caracteres']
  }],
  localizacao: {
    endereco: String,
    cidade: String,
    pais: String,
    coordenadas: {
      lat: Number,
      lng: Number
    }
  },
  anexos: [{
    nome: String,
    url: String,
    tipo: String,
    tamanho: Number
  }],
  observacoes: {
    type: String,
    trim: true,
    maxlength: [500, 'Observações não podem ter mais de 500 caracteres']
  },
  status: {
    type: String,
    enum: ['ativo', 'cancelado', 'pendente'],
    default: 'ativo'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compostos para performance
gastoSchema.index({ user: 1, mes: 1, ano: 1 });
gastoSchema.index({ user: 1, categoria: 1, data: -1 });
gastoSchema.index({ user: 1, data: -1 });
gastoSchema.index({ user: 1, tipo: 1 });
gastoSchema.index({ user: 1, isDeleted: 1 });

// Índice de texto para busca
gastoSchema.index({ 
  descricao: 'text', 
  observacoes: 'text',
  tags: 'text'
});

// Virtual para valor formatado
gastoSchema.virtual('valorFormatado').get(function() {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.valor);
});

// Virtual para data formatada
gastoSchema.virtual('dataFormatada').get(function() {
  return this.data.toLocaleDateString('pt-PT');
});

// Middleware para definir mês e ano automaticamente
gastoSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('data')) {
    const data = new Date(this.data);
    this.mes = data.toLocaleDateString('pt-PT', { month: 'short' }).toLowerCase();
    this.ano = data.getFullYear();
  }
  next();
});

// Método estático para buscar gastos por período
gastoSchema.statics.findByPeriod = function(userId, mes, ano) {
  return this.find({
    user: userId,
    mes: mes,
    ano: ano,
    isDeleted: false
  }).sort({ data: -1 });
};

// Método estático para buscar gastos por categoria
gastoSchema.statics.findByCategory = function(userId, categoria, limit = 50) {
  return this.find({
    user: userId,
    categoria: categoria,
    isDeleted: false
  }).sort({ data: -1 }).limit(limit);
};

// Método estático para estatísticas
gastoSchema.statics.getStats = function(userId, mes, ano) {
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        mes: mes,
        ano: ano,
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$categoria',
        total: { $sum: '$valor' },
        count: { $sum: 1 },
        media: { $avg: '$valor' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

module.exports = mongoose.model('Gasto', gastoSchema);
