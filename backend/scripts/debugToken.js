import mongoose from 'mongoose';
import RegistrationToken from '../models/RegistrationToken.js';
import dotenv from 'dotenv';

dotenv.config();

const debugToken = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 获取最新的令牌
    const latestToken = await RegistrationToken.findOne().sort({ createdAt: -1 });
    
    if (!latestToken) {
      console.log('❌ No tokens found in database');
      return;
    }

    console.log('\n📋 Latest Token Info:');
    console.log('📧 Email:', latestToken.email);
    console.log('🔑 Token:', latestToken.token);
    console.log('⏰ Created:', latestToken.createdAt);
    console.log('⏰ Expires:', latestToken.expiresAt);
    console.log('🔒 Used:', latestToken.used);
    console.log('📅 Now:', new Date());
    console.log('⏳ Valid?', !latestToken.used && latestToken.expiresAt > new Date());
    
    // 测试验证逻辑
    const tokenToTest = latestToken.token;
    console.log('\n🧪 Testing validation logic...');
    
    const validationResult = await RegistrationToken.findOne({ 
      token: tokenToTest, 
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (validationResult) {
      console.log('✅ Token validation SUCCESS');
      console.log('📧 Email from validation:', validationResult.email);
    } else {
      console.log('❌ Token validation FAILED');
      
      // 分别检查各个条件
      const tokenExists = await RegistrationToken.findOne({ token: tokenToTest });
      console.log('🔍 Token exists:', !!tokenExists);
      
      if (tokenExists) {
        console.log('🔍 Used status:', tokenExists.used);
        console.log('🔍 Expires at:', tokenExists.expiresAt);
        console.log('🔍 Current time:', new Date());
        console.log('🔍 Is expired:', tokenExists.expiresAt <= new Date());
      }
    }

    // 生成测试URL
    console.log('\n🌐 Test URL:');
    console.log(`http://localhost:3000/register?token=${tokenToTest}`);
    console.log('\n🌐 API Test URL:');
    console.log(`http://localhost:5001/api/users/validate-token/${tokenToTest}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

debugToken(); 