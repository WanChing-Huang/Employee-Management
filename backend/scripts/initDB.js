import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const initializeDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if HR user already exists
    const existingHR = await User.findOne({ role: 'hr' });
    if (existingHR) {
      console.log('✅ HR user already exists:', existingHR.email);
      return;
    }

    // Create initial HR user
    const hrUser = new User({
      username: 'hradmin',
      email: 'hr@company.com',
      password: '12345678',
      role: 'hr',
      firstName: 'HR',
      lastName: 'Admin'
    });

    await hrUser.save();
    console.log('✅ Initial HR user created successfully');
    console.log('📧 Email: hr@company.com');
    console.log('🔑 Password: password123');
    console.log('👤 Username: hradmin');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit(0);
  }
};

initializeDatabase(); 