const express = require('express');
const Election = require('../models/Election');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/elections — List all elections
router.get('/', protect, async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/elections/:id — Get single election
router.get('/:id', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/elections — Create election (admin)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      createdBy: req.user._id
    });

    res.status(201).json(election);
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/elections/:id — Update election (admin)
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/elections/:id — Delete election (admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
