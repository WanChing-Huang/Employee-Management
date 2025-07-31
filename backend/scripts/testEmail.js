import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testEmailConnection = async () => {
  try {
    console.log('🧪 Testing email configuration...');
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    
    // Send test email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Employee Management System - Test Email',
      text: 'This is a test email from the Employee Management System. Email configuration is working correctly!'
    });
    console.log('✅ Test email sent successfully');
    
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Enable 2-step verification on your Gmail account');
    console.log('2. Generate an app password for this application');
    console.log('3. Use the app password (not your regular password) in EMAIL_PASS');
  }
};

testEmailConnection(); 