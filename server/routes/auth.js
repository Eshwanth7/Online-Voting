const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, getOTPExpiry, sendOTPEmail, sendResetPasswordEmail } = require('../utils/otp');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email: rawEmail, phone, voterId, password } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { voterId }]
    });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Voter ID already registered'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      voterId,
      password,
      otp,
      otpExpires
    });

    // Send the OTP via actual Email instead of just logging it
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      console.warn(`Failed to send email to ${email}. Logging to console as backup: ${otp}`);
      console.log(`\n========================================`);
      console.log(`  OTP for ${email}: ${otp}`);
      console.log(`  Expires in 10 minutes`);
      console.log(`========================================\n`);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your OTP.',
      userId: user._id,
      email: user.email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email: rawEmail, otp } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ message: 'OTP verified successfully. You can now login.' });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = getOTPExpiry();
    await user.save();

    // Send the new OTP via actual Email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      console.warn(`Failed to send email to ${email}. Logging to console as backup: ${otp}`);
      console.log(`\n========================================`);
      console.log(`  New OTP for ${email}: ${otp}`);
      console.log(`  Expires in 10 minutes`);
      console.log(`========================================\n`);
    }

    res.json({ message: 'New OTP sent successfully.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check verification
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        needsVerification: true,
        email: user.email
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        voterId: user.voterId,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      // For security, always return a success message if the email is well-formatted,
      // to prevent "Account Enumeration" where hackers check which emails exist.
      return res.json({ message: 'If an account exists with this email, a password reset OTP has been sent.' });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = getOTPExpiry();
    await user.save();

    const emailSent = await sendResetPasswordEmail(email, otp);

    if (!emailSent) {
      console.warn(`Forgot PW email failed to ${email}. Backup OTP: ${otp}`);
      console.log(`\n========================================`);
      console.log(`  RESET OTP for ${email}: ${otp}`);
      console.log(`========================================\n`);
    }

    res.json({ message: 'If an account exists with this email, a password reset OTP has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;
    const email = rawEmail?.toLowerCase().trim();

    const user = await User.findOne({ 
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
