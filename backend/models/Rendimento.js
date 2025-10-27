const mongoose = require('mongoose');

const rendimentoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  fonte: {
    type: String,
    required: [true, 'Fonte é obrigatória'],
    trim: true,
    maxlength: [100, 'Fonte não pode ter mais de 100 caracteres']
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor não pode ser negativo'],
    max: [1000000, 'Valor não pode exceder 1.000.000']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [200, 'Descrição não pode ter mais de 200 caracteres']
  },
  tipo: {
    type: String,
    enum: ['salario', 'freelance', 'investimento', 'bonus', 'outros'],
    default: 'salario'
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
  diasTrabalhados: {
    andre: {
      type: Number,
      min: 0,
      max: 31,
      default: 0
    },
    aline: {
      type: Number,
      min: 0,
      max: 31,
      default: 0
    }
  },
  valoresPorDia: {
    andre: {
      type: Number,
      default: 0
    },
    aline: {
      type: Number,
      default: 0
    }
  },
  iva: {
    type: Number,
    default: 0.23,
    min: 0,
    max: 1
  },
  valorLiquido: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pendente', 'confirmado', 'cancelado'],
    default: 'confirmado'
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

// Índices para performance
rendimentoSchema.index({ user: 1, mes: 1, ano: 1 });
rendimentoSchema.index({ user: 1, data: -1 });
rendimentoSchema.index({ user: 1, tipo: 1 });
rendimentoSchema.index({ user: 1, isDeleted: 1 });

// Virtual para valor formatado
rendimentoSchema.virtual('valorFormatado').get(function() {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.valor);
});

// Virtual para valor líquido formatado
rendimentoSchema.virtual('valorLiquidoFormatado').get(function() {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.valorLiquido);
});

// Middleware para calcular valor líquido
rendimentoSchema.pre('save', function(next) {
  if (this.isModified('valor') || this.isModified('iva')) {
    this.valorLiquido = this.valor * (1 - this.iva);
  }
  
  if (this.isNew || this.isModified('data')) {
    const data = new Date(this.data);
    this.mes = data.toLocaleDateString('pt-PT', { month: 'short' }).toLowerCase();
    this.ano = data.getFullYear();
  }
  
  next();
});

// Método estático para buscar rendimentos por período
rendimentoSchema.statics.findByPeriod = function(userId, mes, ano) {
  return this.find({
    user: userId,
    mes: mes,
    ano: ano,
    isDeleted: false
  }).sort({ data: -1 });
};

// Método estático para total de rendimentos
rendimentoSchema.statics.getTotalByPeriod = function(userId, mes, ano) {
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
        _id: null,
        totalBruto: { $sum: '$valor' },
        totalLiquido: { $sum: '$valorLiquido' },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Rendimento', rendimentoSchema);
