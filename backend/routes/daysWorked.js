const express = require('express');
const { getDaysWorked, upsertDaysWorked } = require('../controllers/daysWorkedController');

const router = express.Router();

router.get('/', getDaysWorked);
router.put('/', upsertDaysWorked);

module.exports = router;


