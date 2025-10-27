const Rendimento = require('../models/Rendimento');
const { validationResult } = require('express-validator');

// @desc    Obter todos os rendimentos do usuário
// @route   GET /api/rendimentos
// @access  Private
const getRendimentos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      tipo,
      mes,
      ano,
      sort = '-data'
    } = req.query;

    // Construir filtros
    const filters = {
      user: req.user._id,
      isDeleted: false
    };

    if (tipo) filters.tipo = tipo;
    if (mes) filters.mes = mes;
    if (ano) filters.ano = parseInt(ano);

    // Calcular paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Buscar rendimentos
    const rendimentos = await Rendimento.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Contar total
    const total = await Rendimento.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      data: {
        rendimentos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar rendimentos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter rendimento por ID
// @route   GET /api/rendimentos/:id
// @access  Private
const getRendimentoById = async (req, res) => {
  try {
    const rendimento = await Rendimento.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    }).populate('user', 'name email');

    if (!rendimento) {
      return res.status(404).json({
        status: 'error',
        message: 'Rendimento não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { rendimento }
    });

  } catch (error) {
    console.error('Erro ao buscar rendimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo rendimento
// @route   POST /api/rendimentos
// @access  Private
const createRendimento = async (req, res) => {
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

    // Adicionar usuário aos dados
    const rendimentoData = {
      ...req.body,
      user: req.user._id
    };

    const rendimento = await Rendimento.create(rendimentoData);

    res.status(201).json({
      status: 'success',
      data: { rendimento }
    });

  } catch (error) {
    console.error('Erro ao criar rendimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar rendimento
// @route   PUT /api/rendimentos/:id
// @access  Private
const updateRendimento = async (req, res) => {
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

    const rendimento = await Rendimento.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        isDeleted: false
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!rendimento) {
      return res.status(404).json({
        status: 'error',
        message: 'Rendimento não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { rendimento }
    });

  } catch (error) {
    console.error('Erro ao atualizar rendimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar rendimento (soft delete)
// @route   DELETE /api/rendimentos/:id
// @access  Private
const deleteRendimento = async (req, res) => {
  try {
    const rendimento = await Rendimento.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
        isDeleted: false
      },
      { isDeleted: true },
      { new: true }
    );

    if (!rendimento) {
      return res.status(404).json({
        status: 'error',
        message: 'Rendimento não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Rendimento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar rendimento:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter rendimentos por período
// @route   GET /api/rendimentos/period/:mes/:ano
// @access  Private
const getRendimentosByPeriod = async (req, res) => {
  try {
    const { mes, ano } = req.params;

    const rendimentos = await Rendimento.findByPeriod(req.user._id, mes, parseInt(ano));

    res.status(200).json({
      status: 'success',
      data: { rendimentos }
    });

  } catch (error) {
    console.error('Erro ao buscar rendimentos por período:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter estatísticas dos rendimentos
// @route   GET /api/rendimentos/stats
// @access  Private
const getRendimentosStats = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const userId = req.user._id;

    let matchFilter = {
      user: userId,
      isDeleted: false
    };

    if (mes) matchFilter.mes = mes;
    if (ano) matchFilter.ano = parseInt(ano);

    const stats = await Rendimento.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$valor' },
          totalLiquido: { $sum: '$valorLiquido' },
          count: { $sum: 1 },
          media: { $avg: '$valor' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calcular totais gerais
    const totalGeral = await Rendimento.getTotalByPeriod(userId, mes, parseInt(ano));

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        totais: totalGeral[0] || { totalBruto: 0, totalLiquido: 0, count: 0 }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getRendimentos,
  getRendimentoById,
  createRendimento,
  updateRendimento,
  deleteRendimento,
  getRendimentosByPeriod,
  getRendimentosStats
};
