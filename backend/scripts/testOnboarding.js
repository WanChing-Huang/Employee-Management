import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const testOnboardingSubmission = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. 获取测试用户
    const testUser = await User.findOne({ email: 'gonbik7@gmail.com' });
    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('👤 Test user found:');
    console.log('   Username:', testUser.username);
    console.log('   Email:', testUser.email);
    console.log('   ID:', testUser._id);

    // 2. 生成JWT令牌
    const token = jwt.sign(
      { id: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('🔑 Generated JWT token');

    // 3. 检查是否已有profile
    const existingProfile = await UserProfile.findOne({ user: testUser._id });
    if (existingProfile) {
      console.log('📋 Existing profile found:');
      console.log('   Status:', existingProfile.status);
      console.log('   Created:', existingProfile.createdAt);
      console.log('   Profile ID:', existingProfile._id);
    } else {
      console.log('📋 No existing profile found');
    }

    // 4. 准备测试数据
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'M',
      preferredName: 'Johnny',
      address: {
        buildingApt: '123',
        streetName: 'Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      },
      cellPhone: '(123) 456-7890',  // 修正格式
      workPhone: '(098) 765-4321',  // 修正格式
      ssn: '123-45-6789',
      dateOfBirth: '1990-01-01',
      gender: 'male',  // 修正为小写
      workAuthorization: {
        isPermanentResidentOrCitizen: true,
        residentType: 'Citizen'
      },
      emergencyContacts: [{
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        phone: '(555) 123-4567',  // 修正格式
        relationship: 'Spouse'
      }],
      reference: {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@company.com',
        phone: '(555) 567-8901',  // 修正格式
        relationship: 'Former Supervisor'
      }
    };

    console.log('\n🧪 Testing API submission...');

    try {
      // 5. 测试API调用
      const method = existingProfile ? 'PUT' : 'POST';
      const path = existingProfile 
        ? `/api/onboarding/${existingProfile._id}`
        : '/api/onboarding';
      
      const postData = JSON.stringify(testData);
      
      const options = {
        hostname: 'localhost',
        port: 5001,
        path: path,
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(data);
              resolve({ status: res.statusCode, data: parsedData });
            } catch (e) {
              resolve({ status: res.statusCode, data: data });
            }
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });

      console.log('✅ API call successful!');
      console.log('Status:', response.status);
      console.log('Response:', response.data);

    } catch (error) {
      console.log('❌ API call failed:');
      console.log('Error:', error.message);
    }

    // 6. 检查数据库中的结果
    console.log('\n🔍 Checking database after submission...');
    const updatedProfile = await UserProfile.findOne({ user: testUser._id });
    if (updatedProfile) {
      console.log('✅ Profile found in database:');
      console.log('   Status:', updatedProfile.status);
      console.log('   First Name:', updatedProfile.firstName);
      console.log('   Last Name:', updatedProfile.lastName);
      console.log('   Updated:', updatedProfile.updatedAt);
    } else {
      console.log('❌ No profile found in database');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

testOnboardingSubmission(); 