// backend/src/services/email.service.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {

  // For production, use real email service
  return nodemailer.createTransport({
     service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASSWORD // your app password
  }
  });
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    // Default email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"HR Team" <hr@company.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent: %s', info.messageId);

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};




// Email templates
export const emailTemplates = {
  registrationInvite: (data) => ({
    subject: 'Employee Registration Invitation',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f4f4f4; padding: 20px; margin-top: 20px; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Our Company!</h1>
            </div>
            <div class="content">
              <h2>Dear ${data.firstName} ${data.lastName},</h2>
              <p>You have been invited to complete your employee registration.</p>
              <p>Please click the button below to begin your registration process:</p>
              <div style="text-align: center;">
                <a href="${data.registrationLink}" class="button">Complete Registration</a>
              </div>
              <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
                ${data.registrationLink}
              </p>
              <p><strong>Important:</strong> This link will expire in 3 hours.</p>
            </div>
            <div class="footer">
              <p>If you have any questions, please contact HR.</p>
              <p>&copy; 2024 Company Name. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  documentApproved: (data) => ({
    subject: `Document Approved: ${data.documentType}`,
    html: `
      <h2>Document Approval Notification</h2>
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Your ${data.documentType} has been approved.</p>
      ${data.nextStep ? `<p><strong>Next Step:</strong> ${data.nextStep}</p>` : ''}
      <p>Please log in to your account to continue with the process.</p>
      <p>Best regards,<br>HR Team</p>
    `
  }),

  documentRejected: (data) => ({
    subject: `Document Rejected: ${data.documentType}`,
    html: `
      <h2>Document Review Update</h2>
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Your ${data.documentType} has been rejected.</p>
      ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
      <p>Please address the feedback and resubmit the document.</p>
      <p>Best regards,<br>HR Team</p>
    `
  }),

  applicationStatusUpdate: (data) => ({
    subject: `Onboarding Application ${data.status}`,
    html: `
      <h2>Onboarding Application Update</h2>
      <p>Dear ${data.firstName} ${data.lastName},</p>
      <p>Your onboarding application has been <strong>${data.status.toLowerCase()}</strong>.</p>
      ${data.feedback ? `<p><strong>Feedback:</strong> ${data.feedback}</p>` : ''}
      ${data.status === 'Approved' 
        ? '<p>Congratulations! You can now access all employee features.</p>' 
        : '<p>Please log in to your account to review the feedback and resubmit your application.</p>'
      }
      <p>Best regards,<br>HR Team</p>
    `
  })
};