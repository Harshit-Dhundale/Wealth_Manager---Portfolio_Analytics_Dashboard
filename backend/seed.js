import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Holding from './models/Holding.js';
import Historical from './models/Historical.js';
import { holdingsData } from './data/holdings.js';
import { historicalData } from './data/historical.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    await Holding.deleteMany({});
    await Historical.deleteMany({});

    await Holding.insertMany(holdingsData);
    await Historical.insertMany(historicalData);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();