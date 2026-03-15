/**
 * Seed script to create an admin user.
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'pendyalaeshwanth@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      console.log('Updating existing admin credentials...');
      existingAdmin.email = 'pendyalaeshwanth@gmail.com';
      existingAdmin.password = 'Eshwanth_admin@123';
      await existingAdmin.save();
      console.log('Admin credentials updated successfully.');
    } else {
      // Create admin user
      const admin = await User.create({
        name: 'Admin',
        email: 'pendyalaeshwanth@gmail.com',
        phone: '8555991875',
        voterId: 'ADMIN001',
        password: 'Eshwanth_admin@123',
        role: 'admin',
        isVerified: true
      });
  
      console.log('\n========================================');
      console.log('  Admin user created successfully!');
      console.log('  Email: pendyalaeshwanth@gmail.com');
      console.log('  Password: Eshwanth_admin@123');
      console.log('========================================\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
