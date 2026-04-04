require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'pendyalaeshwanth@gmail.com' });
    if (user) {
      console.log('User found! ID:', user._id, 'isVerified:', user.isVerified);
    } else {
      console.log('User not found. You need to register first.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkUser();
