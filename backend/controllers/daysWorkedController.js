import asyncHandler from 'express-async-handler';
import DaysWorked from '../models/DaysWorked.js';

// GET /api/days-worked?mes=jan&ano=2025
export const getDaysWorked = asyncHandler(async (req, res) => {
  const { mes: mesId, ano } = req.query;
  const filter = { user: req.user._id };
  if (mesId) filter.mesId = mesId;
  if (ano) filter.ano = parseInt(ano);
  const docs = await DaysWorked.find(filter);
  res.json({ status: 'success', days: docs });
});

// PUT /api/days-worked
export const upsertDaysWorked = asyncHandler(async (req, res) => {
  const { mesId, ano, andre, aline } = req.body;
  if (!mesId || !ano) {
    res.status(400);
    throw new Error('mesId e ano são obrigatórios');
  }
  const update = { andre, aline };
  const doc = await DaysWorked.findOneAndUpdate(
    { user: req.user._id, mesId, ano },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ status: 'success', day: doc });
});


