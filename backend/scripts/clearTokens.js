import mongoose from 'mongoose';
import RegistrationToken from '../models/RegistrationToken.js';
import dotenv from 'dotenv';

dotenv.config();

const clearTokens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 删除所有过期的令牌
    const expiredTokens = await RegistrationToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`🗑️  Deleted ${expiredTokens.deletedCount} expired tokens`);

    // 显示所有有效的令牌
    const validTokens = await RegistrationToken.find({
      expiresAt: { $gte: new Date() }
    });
    
    console.log('\n📋 Current valid tokens:');
    if (validTokens.length === 0) {
      console.log('   No valid tokens found');
    } else {
      validTokens.forEach(token => {
        console.log(`   📧 ${token.email} - Expires: ${token.expiresAt.toLocaleString()}`);
      });
    }

    // 询问是否要删除特定邮箱的令牌
    const emailToDelete = process.argv[2];
    if (emailToDelete) {
      const result = await RegistrationToken.deleteMany({ email: emailToDelete });
      if (result.deletedCount > 0) {
        console.log(`\n✅ Deleted ${result.deletedCount} token(s) for ${emailToDelete}`);
      } else {
        console.log(`\n❌ No tokens found for ${emailToDelete}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

clearTokens(); 