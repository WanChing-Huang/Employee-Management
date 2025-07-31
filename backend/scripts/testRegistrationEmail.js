import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testRegistrationEmail = async () => {
  try {
    console.log('🧪 Testing registration email process...');
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? 'Set (Hidden)' : 'NOT SET');
    
    // 使用和userController.js完全相同的配置
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true, // Use SSL/TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Transporter created');

    // 验证连接
    await transporter.verify();
    console.log('✅ Connection verified');

    // 模拟实际的注册邮件内容
    const testEmail = 'gonbik7@gmail.com';  // 使用您要测试的邮箱
    const token = 'test123456';
    const registrationLink = `${process.env.FRONTEND_URL}/register?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Employee Registration Invitation - Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Company! (TEST EMAIL)</h2>
          <p>You have been invited to join our employee management system.</p>
          <p>Please click the link below to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Complete Registration
            </a>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 3 hours</li>
            <li>You can only use this link once</li>
            <li>Please complete your registration before the link expires</li>
          </ul>
          <p>If you have any questions, please contact HR.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is a TEST email from the Employee Management System.
          </p>
        </div>
      `
    };

    console.log('📤 Sending test registration email...');
    await transporter.sendMail(mailOptions);
    console.log('✅ Test registration email sent successfully!');
    console.log(`📧 Sent to: ${testEmail}`);
    console.log(`🔗 Registration link: ${registrationLink}`);

  } catch (error) {
    console.error('❌ Error sending registration email:', error);
    console.log('\n🔍 Debugging info:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  }
};

testRegistrationEmail(); 