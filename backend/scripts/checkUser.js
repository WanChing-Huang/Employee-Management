import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'gonbik7@gmail.com';
    console.log(`\n🔍 Checking if user exists for email: ${email}`);

    const user = await User.findOne({ email });
    
    if (user) {
      console.log('✅ User FOUND:');
      console.log('👤 Username:', user.username);
      console.log('📧 Email:', user.email);
      console.log('🔐 Role:', user.role);
      console.log('📅 Created:', user.createdAt);
      console.log('\n💡 This user can login with their credentials.');
    } else {
      console.log('❌ User NOT FOUND');
      console.log('💡 This means the registration was not completed successfully.');
      console.log('💡 The token was marked as used but registration failed.');
    }

    // 检查所有用户
    const allUsers = await User.find({}, 'username email role createdAt');
    console.log('\n📋 All users in system:');
    if (allUsers.length === 0) {
      console.log('   No users found');
    } else {
      allUsers.forEach(user => {
        console.log(`   👤 ${user.username} (${user.email}) - ${user.role} - ${user.createdAt.toDateString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

checkUser(); 