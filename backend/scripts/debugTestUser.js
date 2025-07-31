import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Document from '../models/Document.js';
import dotenv from 'dotenv';

dotenv.config();

const debugTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test.employee@company.com';
    
    // 1. 检查用户
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:');
    console.log('   ID:', user.id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);

    // 2. 检查用户profile
    const profile = await UserProfile.findOne({ user: user._id });
    if (!profile) {
      console.log('❌ UserProfile not found');
      return;
    }
    
    console.log('\n📋 UserProfile found:');
    console.log('   Profile ID:', profile.id);
    console.log('   Profile _id:', profile._id);
    console.log('   Name:', profile.firstName, profile.lastName);
    console.log('   Status:', profile.status);
    console.log('   Email:', profile.email);
    console.log('   Created:', profile.createdAt);

    // 3. 检查文档
    const document = await Document.findOne({ userProfile: profile._id });
    console.log('\n📄 Documents:');
    if (document) {
      console.log('   Document found:');
      console.log('   Document ID:', document.id);
      console.log('   Driver License:', document.driverLicense?.file || 'None');
      console.log('   Profile Picture (from profile):', profile.profilePicture || 'None');
      console.log('   Visa Documents:', document.visaDocuments.length);
    } else {
      console.log('   No document record found');
    }

    // 4. 测试前端应该收到的数据
    console.log('\n🌐 Frontend API responses:');
    console.log('GET /api/onboarding/user/' + user.id + ' should return:');
    console.log('   Profile ID:', profile.id);
    console.log('   existingProfile.id:', profile.id);
    
    console.log('\nGET /api/documents/' + profile.id + ' should return:');
    const docResponse = {
      document: document || null,
      profilePicture: profile.profilePicture || null
    };
    console.log('   Response:', JSON.stringify(docResponse, null, 2));

    // 5. 前端显示条件检查
    console.log('\n🔍 Frontend display condition check:');
    console.log('   existingProfile exists:', !!profile);
    console.log('   existingProfile.id exists:', !!profile?.id);
    console.log('   Condition (existingProfile && existingProfile.id):', !!(profile && profile.id));
    console.log('   Should show upload buttons:', !!(profile && profile.id));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

debugTestUser(); 