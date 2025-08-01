// db-setup.js
// Run with: node db-setup.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './src/models/User.js'
import UserProfile from './src/models/UserProfile.js';

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

   // Create 5 test employees
    const employeePassword = 'Employee123!';
    const employees = [];

    for (let i = 1; i <= 20; i++) {
      const email = `employee${i}@company.com`;
      const username = `employee${i}`;
      const firstName = `Emp${i}`;
      const lastName = `Test`;

      const user = await User.create({
        username,
        email,
        password: employeePassword,
        role: 'employee',
        firstName,
        lastName,
      });



      employees.push(user);
      console.log(`✅ Test employee created: ${email}`);}

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


const createTestUsersWithProfiles = async () => {
  const testEmployees = Array.from({ length: 20 }).map((_, i) => {
    const num = i + 1;
    return {
      username: `emp${num}`,
      email: `employee${num}@company.com`,
      password: `EmpPass123!`,
      role: 'employee',
      firstName: `Emp${num}`,
      lastName: 'Test',
      profile: {
        email: `employee${num}@company.com`,
        firstName: `Emp${num}`,
        lastName: 'Test',
        preferredName: `ET${num}`,
        address: {
          buildingApt: `Apt 10${num}`,
          streetName: `${100 + num} Test St`,
          city: 'Testville',
          state: 'TX',
          zip: `88500`
        },
        cellPhone: `555-123-45${num.toString().padStart(2, '0')}`,
        workPhone: `555-987-65${num.toString().padStart(2, '0')}`,
        ssn: `123-45-60${num.toString().padStart(2, '0')}`,
        dateOfBirth: new Date(1990, 0, 1),
        gender: 'Male',
        workAuthorization: {
          isPermanentResidentOrCitizen: false,
          visaType: 'H1-B',
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2026, 0, 1)
        },
        reference: {
          firstName: 'Ref',
          lastName: `Test${num}`,
          phone: `555-000-000${num}`,
          email: `ref${num}@test.com`,
          relationship: 'Friend'
        },
        emergencyContacts: [
          {
            firstName: 'Emer',
            lastName: `Contact${num}`,
            phone: `555-111-110${num}`,
            email: `emergency${num}@test.com`,
            relationship: 'Parent'
          }
        ]
      }
    };
  });

  for (const emp of testEmployees) {
    const exists = await User.findOne({ email: emp.email });
    if (exists) {
      console.log(`⚠️  User ${emp.email} already exists`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(emp.password, 10);
    const user = await User.create({
      username: emp.username,
      email: emp.email,
      password: hashedPassword,
      role: emp.role,
      firstName: emp.firstName,
      lastName: emp.lastName
    });

    await UserProfile.create({
      user: user._id,
      ...emp.profile
    });

    console.log(`✅ Created test employee: ${emp.email}`);
  }
};
// Main setup function
const setup = async () => {
  console.log('🚀 Starting database setup...\n');
  
  await connectDB();
  await createTestUsers();
  await createUploadDirs();
  await createTestUsersWithProfiles();
  
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