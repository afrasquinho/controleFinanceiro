const Gasto = require('../models/Gasto');
const { validationResult } = require('express-validator');

// @desc    Obter todos os gastos do usuário
// @route   GET /api/gastos
// @access  Private
const getGastos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoria,
      tipo,
      mes,
      ano,
      sort = '-data'
    } = req.query;

    // Construir filtros
    const filters = { isDeleted: false };

    if (categoria) filters.categoria = categoria;
    if (tipo) filters.tipo = tipo;
    if (mes) {
      // Aceitar formatos com e sem ponto (ex.: 'nov' e 'nov.')
      filters.mes = { $in: [mes, `${mes}.`] };
    }
    if (ano) filters.ano = parseInt(ano);

    // Calcular paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Buscar gastos
    const gastos = await Gasto.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    // Contar total
    const total = await Gasto.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      data: {
        gastos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter gasto por ID
// @route   GET /api/gastos/:id
// @access  Private
const getGastoById = async (req, res) => {
  try {
    const gasto = await Gasto.findOne({ _id: req.params.id, isDeleted: false }).populate('user', 'name email');

    if (!gasto) {
      return res.status(404).json({
        status: 'error',
        message: 'Gasto não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { gasto }
    });

  } catch (error) {
    console.error('Erro ao buscar gasto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo gasto
// @route   POST /api/gastos
// @access  Private
const createGasto = async (req, res) => {
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
    const gastoData = { ...req.body };

    const gasto = await Gasto.create(gastoData);

    res.status(201).json({
      status: 'success',
      data: { gasto }
    });

  } catch (error) {
    console.error('Erro ao criar gasto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar gasto
// @route   PUT /api/gastos/:id
// @access  Private
const updateGasto = async (req, res) => {
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

    const gasto = await Gasto.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!gasto) {
      return res.status(404).json({
        status: 'error',
        message: 'Gasto não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { gasto }
    });

  } catch (error) {
    console.error('Erro ao atualizar gasto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Deletar gasto (soft delete)
// @route   DELETE /api/gastos/:id
// @access  Private
const deleteGasto = async (req, res) => {
  try {
    const gasto = await Gasto.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!gasto) {
      return res.status(404).json({
        status: 'error',
        message: 'Gasto não encontrado'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Gasto deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar gasto:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter gastos por período
// @route   GET /api/gastos/period/:mes/:ano
// @access  Private
const getGastosByPeriod = async (req, res) => {
  try {
    const { mes, ano } = req.params;

    const gastos = await Gasto.findByPeriod(mes, parseInt(ano));

    res.status(200).json({
      status: 'success',
      data: { gastos }
    });

  } catch (error) {
    console.error('Erro ao buscar gastos por período:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter gastos por categoria
// @route   GET /api/gastos/category/:categoria
// @access  Private
const getGastosByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;
    const { limit = 50 } = req.query;

    const gastos = await Gasto.findByCategory(categoria, parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: { gastos }
    });

  } catch (error) {
    console.error('Erro ao buscar gastos por categoria:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter estatísticas dos gastos
// @route   GET /api/gastos/stats
// @access  Private
const getGastosStats = async (req, res) => {
  try {
    const { mes, ano } = req.query;

    let matchFilter = { isDeleted: false };

    if (mes) matchFilter.mes = mes;
    if (ano) matchFilter.ano = parseInt(ano);

    const stats = await Gasto.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$valor' },
          count: { $sum: 1 },
          media: { $avg: '$valor' },
          max: { $max: '$valor' },
          min: { $min: '$valor' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calcular totais gerais
    const totalGeral = await Gasto.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalGeral: { $sum: '$valor' },
          totalTransacoes: { $sum: 1 },
          mediaGeral: { $avg: '$valor' }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        totais: totalGeral[0] || { totalGeral: 0, totalTransacoes: 0, mediaGeral: 0 }
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

// @desc    Buscar gastos por texto
// @route   GET /api/gastos/search
// @access  Private
const searchGastos = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gastos = await Gasto.find({
      $and: [
        { user: req.user._id },
        { isDeleted: false },
        {
          $or: [
            { descricao: { $regex: q, $options: 'i' } },
            { observacoes: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
      .sort({ data: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gasto.countDocuments({
      $and: [
        { user: req.user._id },
        { isDeleted: false },
        {
          $or: [
            { descricao: { $regex: q, $options: 'i' } },
            { observacoes: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        gastos,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar gastos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  getGastosByPeriod,
  getGastosByCategory,
  getGastosStats,
  searchGastos
};
