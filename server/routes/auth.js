const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, getOTPExpiry, hashOTP, verifyOTP, sendOTPEmail, sendResetPasswordEmail } = require('../utils/otp');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Input Validation Helpers ─────────────────────────────────────────────────

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => /^\+?[\d\s\-()]{7,15}$/.test(phone);

// ─── POST /api/auth/register ──────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const { name, email: rawEmail, phone, voterId, password } = req.body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    if (!rawEmail || !isValidEmail(rawEmail)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ message: 'A valid phone number is required' });
    }
    if (!voterId || typeof voterId !== 'string' || voterId.trim().length < 3) {
      return res.status(400).json({ message: 'Voter ID must be at least 3 characters' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const email = rawEmail.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { voterId: voterId.trim() }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? 'Email already registered'
          : 'Voter ID already registered'
      });
    }

    // Generate OTP and hash it before storing
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const otpExpires = getOTPExpiry();

    const user = await User.create({
      name: name.trim(),
      email,
      phone: phone.trim(),
      voterId: voterId.trim(),
      password,
      otp: otpHash,       // Store the hash, not the plain OTP
      otpExpires
    });

    // Send plain OTP via email — store only the hash
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to send email to ${email}. Backup OTP (DEV ONLY): ${otp}`);
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

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────

router.post('/verify-otp', async (req, res) => {
  try {
    const { email: rawEmail, otp } = req.body;

    if (!rawEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const email = rawEmail.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }
    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify using timing-safe hash comparison
    const isValid = verifyOTP(otp, user.otp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

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

// ─── POST /api/auth/resend-otp ───────────────────────────────────────────────

router.post('/resend-otp', async (req, res) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const email = rawEmail.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = generateOTP();
    user.otp = hashOTP(otp);   // Store hash
    user.otpExpires = getOTPExpiry();
    await user.save();

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      console.warn(`Failed to resend email to ${email}. Backup OTP (DEV ONLY): ${otp}`);
    }

    res.json({ message: 'New OTP sent successfully.' });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

// A dummy hash to always run bcrypt.compare even when user doesn't exist —
// prevents timing attacks that would reveal which emails are registered.
const DUMMY_HASH = '$2b$12$invalidhashfortimingprotection.........';

router.post('/login', async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const email = rawEmail.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      // Run a dummy bcrypt compare so response time is consistent
      await bcrypt.compare(password, DUMMY_HASH);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email first',
        needsVerification: true,
        email: user.email
      });
    }

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

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

router.post('/forgot-password', async (req, res) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const email = rawEmail.toLowerCase().trim();
    const user = await User.findOne({ email });

    // Always return a success message to prevent account enumeration
    const genericMessage = 'If an account exists with this email, a password reset OTP has been sent.';

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const otp = generateOTP();
    user.resetPasswordOtp = hashOTP(otp);   // Store hash, not plaintext
    user.resetPasswordExpires = getOTPExpiry();
    await user.save();

    const emailSent = await sendResetPasswordEmail(email, otp);
    if (!emailSent) {
      console.warn(`Forgot PW email failed to ${email}. Backup OTP (DEV ONLY): ${otp}`);
    }

    res.json({ message: genericMessage });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── POST /api/auth/reset-password ───────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  try {
    const { email: rawEmail, otp, newPassword } = req.body;

    if (!rawEmail || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const email = rawEmail.toLowerCase().trim();

    // Find user with a non-expired reset OTP
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Timing-safe OTP comparison
    const isValid = verifyOTP(otp, user.resetPasswordOtp);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

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

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -otp -otpExpires -resetPasswordOtp -resetPasswordExpires'
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
