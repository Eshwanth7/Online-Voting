const mongoose = require('mongoose');

const connectDB = async () => {
  // Use Mongoose's built-in readyState instead of a module-level flag.
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  // This is reliable on Vercel serverless where module state can reset between cold starts.
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  if (mongoose.connection.readyState === 2) {
    // Connection in progress — wait for it
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10s timeout
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(
      `MongoDB Connection Error: ${error.message}. ` +
      `URI starts with: ${process.env.MONGO_URI?.substring(0, 20) || 'NOT SET'}`
    );
    // Do NOT call process.exit(1) — on Vercel it would crash the serverless function
  }
};

module.exports = connectDB;
