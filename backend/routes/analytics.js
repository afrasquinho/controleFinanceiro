const express = require('express');
const { protect } = require('../middleware/auth');
const { getDashboard, getTrends, getCategories } = require('../controllers/analyticsController');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/trends', getTrends);
router.get('/categories', getCategories);

module.exports = router;
