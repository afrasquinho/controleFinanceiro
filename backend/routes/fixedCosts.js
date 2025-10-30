const express = require('express');
const { getFixedCosts, upsertFixedCost } = require('../controllers/fixedCostController');

const router = express.Router();

router.get('/', getFixedCosts);
router.put('/', upsertFixedCost);

module.exports = router;


