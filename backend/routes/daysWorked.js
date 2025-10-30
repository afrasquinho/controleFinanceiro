const express = require('express');
const { protect } = require('../middleware/auth');
const { getDaysWorked, upsertDaysWorked } = require('../controllers/daysWorkedController');

const router = express.Router();

router.use(protect);
router.get('/', getDaysWorked);
router.put('/', upsertDaysWorked);

module.exports = router;


