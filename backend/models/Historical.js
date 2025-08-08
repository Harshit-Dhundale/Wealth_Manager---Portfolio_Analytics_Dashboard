import mongoose from 'mongoose';

const historicalSchema = new mongoose.Schema({
  date: Date,
  portfolioValue: Number,
  nifty50: Number,
Riches: Number,
  gold: Number,
  portfolioReturn: Number,
  niftyReturn: Number,
  goldReturn: Number
});

export default mongoose.model('Historical', historicalSchema);