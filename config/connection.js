const mongoose = require('mongoose');
require('dotenv').config();

const connectionString = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    console.log('MongoDB URI:', connectionString);
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
