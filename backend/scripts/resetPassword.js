import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users and their current info
    const users = await User.find({});
    
    console.log('\n📋 Current users in system:');
    users.forEach(user => {
      console.log(`   👤 ${user.username} (${user.email}) - ${user.role}`);
    });

    // Reset HR password
    const hrUser = await User.findOne({ email: 'hr@company.com' });
    if (hrUser) {
      hrUser.password = 'password123';
      await hrUser.save();
      console.log('\n✅ HR password reset to: password123');
    }

    // Reset test employee password
    const testUser = await User.findOne({ email: 'test.employee@company.com' });
    if (testUser) {
      testUser.password = 'password123';
      await testUser.save();
      console.log('✅ Test employee password reset to: password123');
    }

    console.log('\n🔑 Updated login credentials:');
    console.log('   HR Account:');
    console.log('     Email: hr@company.com');
    console.log('     Password: password123');
    console.log('   Employee Account:');
    console.log('     Email: test.employee@company.com');
    console.log('     Password: password123');

    console.log('\n💡 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

resetPassword(); 