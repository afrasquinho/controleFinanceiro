import asyncHandler from 'express-async-handler';
import FixedCost from '../models/FixedCost.js';

// GET /api/fixed-costs?mes=jan&ano=2025
export const getFixedCosts = asyncHandler(async (req, res) => {
  const { mes: mesId, ano } = req.query;
  const filter = { user: req.user._id };
  if (mesId) filter.mesId = mesId;
  if (ano) filter.ano = parseInt(ano);
  const docs = await FixedCost.find(filter);
  res.json({ status: 'success', costs: docs });
});

// PUT /api/fixed-costs (upsert por categoria)
export const upsertFixedCost = asyncHandler(async (req, res) => {
  const { mesId, ano, categoria, valor } = req.body;
  if (!mesId || !ano || !categoria) {
    res.status(400);
    throw new Error('mesId, ano e categoria são obrigatórios');
  }
  const doc = await FixedCost.findOneAndUpdate(
    { user: req.user._id, mesId, ano, categoria },
    { valor },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ status: 'success', cost: doc });
});


