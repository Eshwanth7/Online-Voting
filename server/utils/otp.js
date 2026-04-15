const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─── OTP Generation ───────────────────────────────────────────────────────────

// Generate a cryptographically secure 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// OTP expiry time (10 minutes from now)
const OTP_EXPIRY_MINUTES = 10;
const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

// Hash an OTP using SHA-256 before storing in the database.
// OTPs are short-lived and randomly generated so SHA-256 is appropriate
// (bcrypt would add unnecessary latency for this use case).
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

// Verify a plain OTP against its stored hash
const verifyOTP = (plainOTP, storedHash) => {
  const hash = crypto.createHash('sha256').update(plainOTP).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
};

// ─── Email Transport (shared factory) ────────────────────────────────────────

// Single factory function — avoids duplicating transporter config
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false, // true for port 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// ─── Email Senders ────────────────────────────────────────────────────────────

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

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

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

const sendResetPasswordEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"VoteSecure Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your VoteSecure Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #4f46e5; text-align: center;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your VoteSecure account. Use the following One-Time Password (OTP) to complete the reset. This code is valid for 10 minutes.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; color: #1e293b; margin: 0;">${otp}</h1>
          </div>
          <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} VoteSecure Voting System</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Reset email sent successfully to ${email} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
};

module.exports = { generateOTP, getOTPExpiry, hashOTP, verifyOTP, sendOTPEmail, sendResetPasswordEmail };
