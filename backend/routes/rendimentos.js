const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getRendimentos,
  getRendimentoById,
  createRendimento,
  updateRendimento,
  deleteRendimento,
  getRendimentosByPeriod,
  getRendimentosStats
} = require('../controllers/rendimentoController');

const router = express.Router();

// Middleware de autenticação desativado temporariamente para migração Mongo

// Validações
const createRendimentoValidation = [
  body('fonte')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Fonte deve ter entre 1 e 100 caracteres'),
  body('valor')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Valor deve ser um número entre 0 e 1.000.000'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição não pode ter mais de 200 caracteres'),
  body('tipo')
    .optional()
    .isIn(['salario', 'freelance', 'investimento', 'bonus', 'outros'])
    .withMessage('Tipo inválido'),
  body('data')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601')
];

const updateRendimentoValidation = [
  param('id').isMongoId().withMessage('ID inválido'),
  body('fonte')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Fonte deve ter entre 1 e 100 caracteres'),
  body('valor')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Valor deve ser um número entre 0 e 1.000.000'),
  body('descricao')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Descrição não pode ter mais de 200 caracteres')
];

// Rotas
router.route('/')
  .get(
    [
      query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
      query('tipo').optional().isIn(['salario', 'freelance', 'investimento', 'bonus', 'outros']),
      query('mes').optional().isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      query('ano').optional().isInt({ min: 2020, max: 2030 })
    ],
    getRendimentos
  )
  .post(createRendimentoValidation, createRendimento);

router.route('/stats')
  .get(
    [
      query('mes').optional().isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      query('ano').optional().isInt({ min: 2020, max: 2030 })
    ],
    getRendimentosStats
  );

router.route('/period/:mes/:ano')
  .get(
    [
      param('mes').isIn(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']),
      param('ano').isInt({ min: 2020, max: 2030 })
    ],
    getRendimentosByPeriod
  );

router.route('/:id')
  .get([param('id').isMongoId().withMessage('ID inválido')], getRendimentoById)
  .put(updateRendimentoValidation, updateRendimento)
  .delete([param('id').isMongoId().withMessage('ID inválido')], deleteRendimento);

module.exports = router;
