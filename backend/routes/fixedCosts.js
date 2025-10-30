const express = require('express');
const { protect } = require('../middleware/auth');
const { getFixedCosts, upsertFixedCost } = require('../controllers/fixedCostController');

const router = express.Router();

router.use(protect);
router.get('/', getFixedCosts);
router.put('/', upsertFixedCost);

module.exports = router;


