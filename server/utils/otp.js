const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// OTP expiry time (10 minutes)
const OTP_EXPIRY_MINUTES = 10;

const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

// Send OTP via Email
const sendOTPEmail = async (email, otp) => {
  try {
    // Create a transporter using SMTP config from .env
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"VoteSecure" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your VoteSecure Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">VoteSecure Registration</h2>
          <p>Hello,</p>
          <p>Thank you for registering with VoteSecure. Please use the following One-Time Password (OTP) to verify your email address. This code is valid for 10 minutes.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #1e293b; margin: 0;">${otp}</h1>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} VoteSecure Voting System</p>
        </div>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { generateOTP, getOTPExpiry, sendOTPEmail };
