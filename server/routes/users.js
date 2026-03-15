const express = require('express');
const User = require('../models/User');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — List all users (admin only)
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -otp -otpExpires')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id — Delete user (admin only)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
