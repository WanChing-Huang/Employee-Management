import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import RegistrationToken from '../models/RegistrationToken.js';
import dotenv from 'dotenv';

dotenv.config();

const deleteUserComplete = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const targetEmail = 'gonbik7@gmail.com';
    console.log(`🗑️  Completely deleting user: ${targetEmail}`);
    console.log('=' .repeat(50));

    // 1. 查找用户
    const user = await User.findOne({ email: targetEmail });
    if (user) {
      console.log('👤 User found:');
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   User ID: ${user._id}`);
    } else {
      console.log('❌ User not found');
    }

    // 2. 删除用户资料 (UserProfile)
    const profileResult = await UserProfile.deleteMany({ 
      $or: [
        { email: targetEmail },
        { user: user?._id }
      ]
    });
    console.log(`\n📋 UserProfile deletion result: ${profileResult.deletedCount} profile(s) deleted`);

    // 3. 删除注册令牌 (RegistrationToken)
    const tokenResult = await RegistrationToken.deleteMany({ email: targetEmail });
    console.log(`🔑 RegistrationToken deletion result: ${tokenResult.deletedCount} token(s) deleted`);

    // 4. 删除用户账户 (User)
    const userResult = await User.deleteMany({ email: targetEmail });
    console.log(`👤 User deletion result: ${userResult.deletedCount} user(s) deleted`);

    // 5. 验证删除结果
    console.log('\n🔍 Verification - checking if any data remains:');
    
    const remainingUser = await User.findOne({ email: targetEmail });
    const remainingProfile = await UserProfile.findOne({ email: targetEmail });
    const remainingTokens = await RegistrationToken.find({ email: targetEmail });

    if (!remainingUser && !remainingProfile && remainingTokens.length === 0) {
      console.log('✅ SUCCESS: All data for this user has been completely deleted');
    } else {
      console.log('⚠️  WARNING: Some data may still exist:');
      if (remainingUser) console.log('   - User account still exists');
      if (remainingProfile) console.log('   - User profile still exists');
      if (remainingTokens.length > 0) console.log(`   - ${remainingTokens.length} registration token(s) still exist`);
    }

    // 6. 总结
    console.log('\n📊 Summary:');
    console.log(`   Users deleted: ${userResult.deletedCount}`);
    console.log(`   Profiles deleted: ${profileResult.deletedCount}`);
    console.log(`   Tokens deleted: ${tokenResult.deletedCount}`);
    console.log(`   Total records deleted: ${userResult.deletedCount + profileResult.deletedCount + tokenResult.deletedCount}`);

    console.log('\n💡 This user can now be completely re-created from scratch.');

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

deleteUserComplete(); 