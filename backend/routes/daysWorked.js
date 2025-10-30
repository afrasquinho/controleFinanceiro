import express from 'express';
import { protect } from '../middleware/auth.js';
import { getDaysWorked, upsertDaysWorked } from '../controllers/daysWorkedController.js';

const router = express.Router();

router.use(protect);
router.get('/', getDaysWorked);
router.put('/', upsertDaysWorked);

export default router;


