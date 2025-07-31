import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import dotenv from 'dotenv';

dotenv.config();

const debugUserProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 检查是否有员工用户
    const employees = await User.find({ role: 'employee' });
    console.log(`\n👤 Found ${employees.length} employee(s):`);
    
    for (const employee of employees) {
      console.log(`\n📋 Employee: ${employee.username} (${employee.email})`);
      console.log(`   User ID: ${employee._id}`);
      console.log(`   Created: ${employee.createdAt}`);
      
      // 查找对应的profile
      const profile = await UserProfile.findOne({ user: employee._id });
      
      if (profile) {
        console.log(`✅ Profile found:`);
        console.log(`   Profile ID: ${profile._id}`);
        console.log(`   Status: ${profile.status}`);
        console.log(`   Created: ${profile.createdAt}`);
        console.log(`   Updated: ${profile.updatedAt}`);
        console.log(`   Name: ${profile.firstName} ${profile.lastName}`);
        if (profile.feedback) {
          console.log(`   Feedback: ${profile.feedback}`);
        }
        
        // 测试API路径
        console.log(`\n🌐 API endpoint to test:`);
        console.log(`   GET /api/onboarding/user/${employee._id}`);
        
      } else {
        console.log(`❌ No profile found for this user`);
      }
      
      console.log('-'.repeat(50));
    }

    // 检查所有profiles的状态分布
    const profileStats = await UserProfile.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Profile Status Distribution:');
    profileStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // 显示最近的状态更新
    const recentUpdates = await UserProfile.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('user', 'username email');
      
    console.log('\n⏰ Recent Status Updates:');
    recentUpdates.forEach(profile => {
      console.log(`   ${profile.user?.username} (${profile.user?.email}): ${profile.status} - ${profile.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

debugUserProfile(); 