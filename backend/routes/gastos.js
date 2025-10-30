const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getGastos,
  getGastoById,
  createGasto,
  updateGasto,
  deleteGasto,
  getGastosByPeriod,
  getGastosByCategory,
  getGastosStats,
  searchGastos
} = require('../controllers/gastoController');

const router = express.Router();

// Middleware de autenticação desativado temporariamente para migração Mongo

// Validações
const createGastoValidation = [
  body('descricao')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Descrição deve ter entre 1 e 200 caracteres'),
  body('valor')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Valor deve ser um número entre 0 e 1.000.000'),
  body('categoria')
    .isIn(['alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'casa', 'vestuario', 'viagens', 'outros'])
    .withMessage('Categoria inválida'),
  body('data')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601'),
  body('tipo')
    .optional()
    .isIn(['variavel', 'fixo'])
    .withMessage('Tipo deve ser "variavel" ou "fixo"')
];

const updateGastoValidation = [
  param('id').isMongoId().withMessage('ID inválido'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Descrição deve ter entre 1 e 200 caracteres'),
  body('valor')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Valor deve ser um número entre 0 e 1.000.000'),
  body('categoria')
    .optional()
    .isIn(['alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'casa', 'vestuario', 'viagens', 'outros'])
    .withMessage('Categoria inválida')
];

// Rotas
router.route('/')
  .get(
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
      query('categoria').optional().isIn(['alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'casa', 'vestuario', 'viagens', 'outros']),
      query('tipo').optional().isIn(['variavel', 'fixo']),
      query('mes').optional().isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      query('ano').optional().isInt({ min: 2020, max: 2030 })
    ],
    getGastos
  )
  .post(createGastoValidation, createGasto);

router.route('/search')
  .get(
    [
      query('q').notEmpty().withMessage('Termo de busca é obrigatório'),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    searchGastos
  );

router.route('/stats')
  .get(
    [
      query('mes').optional().isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      query('ano').optional().isInt({ min: 2020, max: 2030 })
    ],
    getGastosStats
  );

router.route('/period/:mes/:ano')
  .get(
    [
      param('mes').isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      param('ano').isInt({ min: 2020, max: 2030 })
    ],
    getGastosByPeriod
  );

router.route('/category/:categoria')
  .get(
    [
      param('categoria').isIn(['alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 'casa', 'vestuario', 'viagens', 'outros']),
      query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    getGastosByCategory
  );

router.route('/:id')
  .get([param('id').isMongoId().withMessage('ID inválido')], getGastoById)
  .put(updateGastoValidation, updateGasto)
  .delete([param('id').isMongoId().withMessage('ID inválido')], deleteGasto);

module.exports = router;
