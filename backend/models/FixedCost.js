const mongoose = require('mongoose');

const fixedCostSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    mesId: { type: String, required: true },
    ano: { type: Number, required: true },
    categoria: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

fixedCostSchema.index({ user: 1, mesId: 1, ano: 1, categoria: 1 }, { unique: true });

const FixedCost = mongoose.model('FixedCost', fixedCostSchema);
module.exports = FixedCost;


