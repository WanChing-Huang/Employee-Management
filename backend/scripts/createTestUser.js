import mongoose from 'mongoose';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const testEmail = 'test.employee@company.com';
    
    // 1. Check if user already exists
    let testUser = await User.findOne({ email: testEmail });
    
    if (testUser) {
      console.log('👤 Test user already exists:', testUser.username);
    } else {
      // Create new test user
      testUser = new User({
        username: 'testemployee',
        email: testEmail,
        password: 'password123',
        role: 'employee',
        firstName: 'Test',
        lastName: 'Employee'
      });
      
      await testUser.save();
      console.log('✅ Test user created:', testUser.username);
    }

    // 2. Check if profile exists
    let userProfile = await UserProfile.findOne({ user: testUser._id });
    
    if (userProfile) {
      console.log('📋 User profile already exists');
    } else {
      // Create test profile
      userProfile = new UserProfile({
        user: testUser._id,
        email: testUser.email,
        firstName: 'Test',
        lastName: 'Employee',
        status: 'Approved', // Set to approved so user can access documents
        address: {
          buildingApt: '123',
          streetName: 'Test Street',
          city: 'Test City',
          state: 'NY',
          zip: '12345'
        },
        cellPhone: '(555) 123-4567',
        workPhone: '(555) 987-6543',
        ssn: '123-45-6789',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        workAuthorization: {
          isPermanentResidentOrCitizen: false,
          visaType: 'F1(CPT/OPT)',
          startDate: '2024-01-01',
          endDate: '2025-12-31'
        },
        emergencyContacts: [{
          firstName: 'Emergency',
          lastName: 'Contact',
          email: 'emergency@test.com',
          phone: '(555) 111-2222',
          relationship: 'Friend'
        }],
        reference: {
          firstName: 'Reference',
          lastName: 'Person',
          email: 'reference@test.com',
          phone: '(555) 333-4444',
          relationship: 'Former Supervisor'
        }
      });
      
      await userProfile.save();
      console.log('✅ User profile created');
    }

    console.log('\n📊 Test user summary:');
    console.log('   Username:', testUser.username);
    console.log('   Email:', testUser.email);
    console.log('   User ID:', testUser.id);
    console.log('   Profile ID:', userProfile.id);
    console.log('   Profile Status:', userProfile.status);
    console.log('   Visa Type:', userProfile.workAuthorization?.visaType);

    console.log('\n🔑 Login credentials:');
    console.log('   Email:', testUser.email);
    console.log('   Password: password123');

    console.log('\n✅ Test user and profile ready for document upload testing!');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

createTestUser(); 