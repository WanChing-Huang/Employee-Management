import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const testProfileAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. 获取测试用户
    const testUser = await User.findOne({ email: 'gonbik7@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('👤 Test user:');
    console.log(`   Username: ${testUser.username}`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   User ID: ${testUser._id}`);

    // 2. 生成JWT令牌
    const token = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated JWT token');

    // 3. 测试API调用
    const testAPICall = async (userId) => {
      console.log(`\n🧪 Testing API call: GET /api/onboarding/user/${userId}`);
      
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: `/api/onboarding/user/${userId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = data ? JSON.parse(data) : {};
              resolve({ status: res.statusCode, data: parsedData });
            } catch (e) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.end();
      });
    };

    // 4. 测试用正确的用户ID
    try {
      const result = await testAPICall(testUser._id);
      console.log(`✅ API Response - Status: ${result.status}`);
      
      if (result.status === 200) {
        console.log('📋 Profile data retrieved:');
        console.log(`   Name: ${result.data.firstName} ${result.data.lastName}`);
        console.log(`   Status: ${result.data.status}`);
        console.log(`   Email: ${result.data.email}`);
        if (result.data.feedback) {
          console.log(`   Feedback: ${result.data.feedback}`);
        }
      } else {
        console.log('❌ API Error:');
        console.log('   Response:', result.data);
      }
    } catch (error) {
      console.log('❌ API call failed:', error.message);
    }

    // 5. 测试用错误的用户ID格式
    console.log('\n🧪 Testing with invalid user ID...');
    try {
      const invalidResult = await testAPICall('invalid-id');
      console.log(`Status: ${invalidResult.status}`);
      console.log('Response:', invalidResult.data);
    } catch (error) {
      console.log('Error:', error.message);
    }

    // 6. 检查JWT token中的用户ID
    console.log('\n🔍 Checking JWT token content:');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('   Token user ID:', decoded.id);
      console.log('   Token email:', decoded.email);
      console.log('   Token role:', decoded.role);
      
      // 比较ID格式
      console.log('\n🔗 ID Comparison:');
      console.log(`   Database ID: ${testUser._id}`);
      console.log(`   Token ID: ${decoded.id}`);
      console.log(`   Match: ${testUser._id.toString() === decoded.id.toString()}`);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

testProfileAPI(); 