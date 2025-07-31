// db-setup.js
// Run with: node db-setup.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee_management');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema (simplified for setup)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  firstName: String,
  lastName: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Create test users
const createTestUsers = async () => {
  try {
    // Check if HR user already exists
    const existingHR = await User.findOne({ email: 'hr@company.com' });
    if (existingHR) {
      console.log('⚠️  HR user already exists');
      return;
    }

    // Create HR user
    const hrPassword = 'HRPassword123!'
    const hrUser = await User.create({
      username: 'hradmin',
      email: 'hr@company.com',
      password: hrPassword,
      role: 'hr',
      firstName: 'HR',
      lastName: 'Admin'
    });
    console.log('✅ HR user created:', hrUser.email);

    // Create a test employee (optional)
    const employeePassword = 'Employee123!';
    const employee = await User.create({
      username: 'test.employee',
      email: 'test.employee@company.com',
      password: employeePassword,
      role: 'employee',
      firstName: 'Test',
      lastName: 'Employee'
    });
    console.log('✅ Test employee created:', employee.email);

  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
};

// Create upload directories
const createUploadDirs = async () => {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const { dirname } = await import('path');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const dirs = [
    'src/uploads/profiles',
    'src/uploads/documents/driver-licenses',
    'src/uploads/documents/work-authorizations',
    'src/uploads/documents/visa-documents',
    'src/uploads/temp',
    'src/templates'
  ];

  for (const dir of dirs) {
    try {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } catch (error) {
      console.error(`❌ Error creating directory ${dir}:`, error.message);
    }
  }

  // Create sample template files
  try {
    const templateDir = path.join(__dirname, 'src/templates');
    
    // Create empty I-983 template placeholder
    await fs.writeFile(
      path.join(templateDir, 'i983-empty.pdf'),
      'This is a placeholder for I-983 empty template'
    );
    
    // Create sample I-983 template placeholder
    await fs.writeFile(
      path.join(templateDir, 'i983-sample.pdf'),
      'This is a placeholder for I-983 sample template'
    );
    
    console.log('✅ Created template placeholders');
  } catch (error) {
    console.error('❌ Error creating templates:', error.message);
  }
};

// Main setup function
const setup = async () => {
  console.log('🚀 Starting database setup...\n');
  
  await connectDB();
  await createTestUsers();
  await createUploadDirs();
  
  console.log('\n✅ Setup complete!');
  console.log('\n📝 Test Credentials:');
  console.log('HR User:');
  console.log('  Email: hr@company.com');
  console.log('  Password: HRPassword123!');
  console.log('\nTest Employee:');
  console.log('  Email: test.employee@company.com');
  console.log('  Password: Employee123!');
  
  process.exit(0);
};

// Run setup
setup().catch(console.error);