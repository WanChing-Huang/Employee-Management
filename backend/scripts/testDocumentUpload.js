import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Document from '../models/Document.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const testDocumentUpload = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. 获取测试用户和profile
    const testUser = await User.findOne({ email: 'test.employee@company.com' });
    if (!testUser) {
      console.log('❌ Test user not found. Please create a user first.');
      return;
    }

    console.log('👤 Test user found:', testUser.username);

    // 2. 查找用户profile
    const userProfile = await UserProfile.findOne({ user: testUser._id });
    if (!userProfile) {
      console.log('❌ User profile not found. Please complete onboarding first.');
      return;
    }

    console.log('📋 User profile found:', userProfile.firstName, userProfile.lastName);
    console.log('   Profile ID:', userProfile.id);

    // 3. 检查uploads目录
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
      console.log('📁 Created uploads directory');
    }

    // 4. 创建测试文件
    const testFileName = 'test-document.txt';
    const testFilePath = path.join(uploadsDir, testFileName);
    const testContent = 'This is a test document for file upload testing.';
    fs.writeFileSync(testFilePath, testContent);
    console.log('📄 Created test file:', testFileName);

    // 5. 查找或创建文档记录
    let document = await Document.findOne({ userProfile: userProfile._id });
    
    if (document) {
      console.log('📂 Existing document record found:');
      console.log('   Document ID:', document.id);
      console.log('   Driver License:', document.driverLicense?.file || 'Not uploaded');
      console.log('   Visa Documents:', document.visaDocuments.length);
    } else {
      console.log('📂 No existing document record found');
    }

    // 6. 测试文档查询API
    console.log('\n🧪 Testing document APIs...');
    
    // Test getUserDocuments equivalent
    try {
      const docs = await Document.findOne({ userProfile: userProfile._id });
      console.log('✅ Document query successful');
      console.log('   Found document:', !!docs);
      
      if (docs) {
        console.log('   Driver License:', docs.driverLicense?.file || 'None');
        console.log('   Visa Documents count:', docs.visaDocuments.length);
        
        // Show visa documents
        docs.visaDocuments.forEach((visa, index) => {
          console.log(`   Visa Doc ${index + 1}: ${visa.type} - ${visa.status} - ${visa.file}`);
          if (visa.feedback) {
            console.log(`     Feedback: ${visa.feedback}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Document query failed:', error.message);
    }

    // 7. 测试API endpoints
    console.log('\n🌐 API Endpoints to test:');
    console.log(`   GET /api/documents/${userProfile.id}`);
    console.log(`   POST /api/documents/upload/${userProfile.id}`);
    console.log(`   GET /api/documents/download/{filename}?userProfileId=${userProfile.id}`);
    console.log(`   PATCH /api/documents/${userProfile.id}/status/{documentId} (HR only)`);
    console.log(`   DELETE /api/documents/${userProfile.id}`);

    // 8. 测试虚拟ID
    console.log('\n🔍 Testing virtual IDs:');
    console.log('   User ID (virtual):', testUser.id);
    console.log('   User _id (actual):', testUser._id);
    console.log('   Profile ID (virtual):', userProfile.id);
    console.log('   Profile _id (actual):', userProfile._id);
    
    if (document) {
      console.log('   Document ID (virtual):', document.id);
      console.log('   Document _id (actual):', document._id);
    }

    // 9. 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n🗑️  Cleaned up test file');
    }

    console.log('\n✅ Document upload system is ready for testing!');
    console.log('\nNext steps:');
    console.log('1. Start the backend server');
    console.log('2. Login to the frontend with this user');
    console.log('3. Go to onboarding form');
    console.log('4. Try uploading documents');

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

testDocumentUpload(); 