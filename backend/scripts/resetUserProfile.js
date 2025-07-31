import mongoose from 'mongoose';
import UserProfile from '../models/UserProfile.js';
import dotenv from 'dotenv';

dotenv.config();

const resetUserProfile = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2] || 'gonbik7@gmail.com';
    console.log(`🗑️  Resetting profile for user: ${email}`);

    // Delete the user profile
    const result = await UserProfile.deleteMany({ email: email });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted ${result.deletedCount} profile(s) for ${email}`);
      console.log('💡 User can now fill out the onboarding form again');
    } else {
      console.log(`❌ No profiles found for ${email}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
    process.exit(0);
  }
};

resetUserProfile(); 