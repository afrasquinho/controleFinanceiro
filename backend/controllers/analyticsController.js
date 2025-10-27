const Gasto = require('../models/Gasto');
const Rendimento = require('../models/Rendimento');

// @desc    Obter dados do dashboard
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mes, ano } = req.query;

    // Filtros base
    let gastoFilter = { user: userId, isDeleted: false };
    let rendimentoFilter = { user: userId, isDeleted: false };

    if (mes) {
      gastoFilter.mes = mes;
      rendimentoFilter.mes = mes;
    }
    if (ano) {
      gastoFilter.ano = parseInt(ano);
      rendimentoFilter.ano = parseInt(ano);
    }

    // Estatísticas de gastos
    const gastosStats = await Gasto.aggregate([
      { $match: gastoFilter },
      {
        $group: {
          _id: null,
          totalGastos: { $sum: '$valor' },
          totalTransacoes: { $sum: 1 },
          mediaGastos: { $avg: '$valor' },
          gastosPorCategoria: {
            $push: {
              categoria: '$categoria',
              valor: '$valor'
            }
          }
        }
      }
    ]);

    // Estatísticas de rendimentos
    const rendimentosStats = await Rendimento.aggregate([
      { $match: rendimentoFilter },
      {
        $group: {
          _id: null,
          totalRendimentos: { $sum: '$valor' },
          totalLiquido: { $sum: '$valorLiquido' },
          totalTransacoes: { $sum: 1 },
          mediaRendimentos: { $avg: '$valor' }
        }
      }
    ]);

    // Gastos por categoria
    const gastosPorCategoria = await Gasto.aggregate([
      { $match: gastoFilter },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$valor' },
          count: { $sum: 1 },
          media: { $avg: '$valor' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Rendimentos por tipo
    const rendimentosPorTipo = await Rendimento.aggregate([
      { $match: rendimentoFilter },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: '$valor' },
          totalLiquido: { $sum: '$valorLiquido' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calcular saldo
    const totalGastos = gastosStats[0]?.totalGastos || 0;
    const totalRendimentos = rendimentosStats[0]?.totalLiquido || 0;
    const saldo = totalRendimentos - totalGastos;

    res.status(200).json({
      status: 'success',
      data: {
        resumo: {
          totalGastos,
          totalRendimentos,
          saldo,
          totalTransacoes: (gastosStats[0]?.totalTransacoes || 0) + (rendimentosStats[0]?.totalTransacoes || 0)
        },
        gastos: {
          total: gastosStats[0]?.totalGastos || 0,
          transacoes: gastosStats[0]?.totalTransacoes || 0,
          media: gastosStats[0]?.mediaGastos || 0,
          porCategoria: gastosPorCategoria
        },
        rendimentos: {
          total: rendimentosStats[0]?.totalRendimentos || 0,
          liquido: rendimentosStats[0]?.totalLiquido || 0,
          transacoes: rendimentosStats[0]?.totalTransacoes || 0,
          media: rendimentosStats[0]?.mediaRendimentos || 0,
          porTipo: rendimentosPorTipo
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter tendências
// @route   GET /api/analytics/trends
// @access  Private
const getTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { meses = 12 } = req.query;

    // Gastos por mês (últimos N meses)
    const gastosPorMes = await Gasto.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: { mes: '$mes', ano: '$ano' },
          total: { $sum: '$valor' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.ano': 1, '_id.mes': 1 }
      },
      { $limit: parseInt(meses) }
    ]);

    // Rendimentos por mês
    const rendimentosPorMes = await Rendimento.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: { mes: '$mes', ano: '$ano' },
          total: { $sum: '$valor' },
          liquido: { $sum: '$valorLiquido' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.ano': 1, '_id.mes': 1 }
      },
      { $limit: parseInt(meses) }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        gastosPorMes,
        rendimentosPorMes
      }
    });

  } catch (error) {
    console.error('Erro ao buscar tendências:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter análise por categorias
// @route   GET /api/analytics/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mes, ano } = req.query;

    let filter = { user: userId, isDeleted: false };
    if (mes) filter.mes = mes;
    if (ano) filter.ano = parseInt(ano);

    // Análise detalhada por categoria
    const categoriaAnalysis = await Gasto.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$categoria',
          total: { $sum: '$valor' },
          count: { $sum: 1 },
          media: { $avg: '$valor' },
          max: { $max: '$valor' },
          min: { $min: '$valor' },
          gastos: {
            $push: {
              id: '$_id',
              descricao: '$descricao',
              valor: '$valor',
              data: '$data'
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Calcular percentuais
    const totalGeral = categoriaAnalysis.reduce((sum, cat) => sum + cat.total, 0);
    const categoriaComPercentual = categoriaAnalysis.map(cat => ({
      ...cat,
      percentual: totalGeral > 0 ? ((cat.total / totalGeral) * 100).toFixed(2) : 0
    }));

    res.status(200).json({
      status: 'success',
      data: {
        categorias: categoriaComPercentual,
        totalGeral,
        totalCategorias: categoriaAnalysis.length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar análise por categorias:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboard,
  getTrends,
  getCategories
};
