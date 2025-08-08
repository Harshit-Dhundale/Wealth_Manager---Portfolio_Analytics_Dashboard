import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
  symbol: String,
  companyName: String,
  quantity: Number,
  avgPrice: Number,
  currentPrice: Number,
  sector: String,
  marketCap: String,
  exchange: String,
  value: Number,
  gainLoss: Number,
  gainLossPercent: Number
});

export default mongoose.model('Holding', holdingSchema);