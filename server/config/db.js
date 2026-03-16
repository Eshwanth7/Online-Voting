const mongoose = require('mongoose');

let isConnected = false; // track connection status

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5s timeout
    });
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}. Is MONGO_URI set properly? Current URI start: ${process.env.MONGO_URI?.substring(0, 15)}`);
    // DON'T do process.exit(1) on Vercel or it crashes the Function completely!
  }
};

module.exports = connectDB;
