import express from 'express';
import { protect } from '../middleware/auth.js';
import { getFixedCosts, upsertFixedCost } from '../controllers/fixedCostController.js';

const router = express.Router();

router.use(protect);
router.get('/', getFixedCosts);
router.put('/', upsertFixedCost);

export default router;


