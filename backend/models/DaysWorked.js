const mongoose = require('mongoose');

const daysWorkedSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    mesId: { type: String, required: true },
    ano: { type: Number, required: true },
    andre: { type: Number, required: true, min: 0, max: 31 },
    aline: { type: Number, required: true, min: 0, max: 31 },
  },
  { timestamps: true }
);

daysWorkedSchema.index({ user: 1, mesId: 1, ano: 1 }, { unique: true });

const DaysWorked = mongoose.model('DaysWorked', daysWorkedSchema);
module.exports = DaysWorked;


