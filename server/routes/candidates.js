const express = require('express');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/candidates/election/:electionId — List candidates for an election
router.get('/election/:electionId', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.electionId })
      .sort({ name: 1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/candidates — Add candidate (admin)
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const { name, party, description, election } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Candidate name must be at least 2 characters' });
    }
    if (!election) {
      return res.status(400).json({ message: 'Election ID is required' });
    }

    // Verify the election exists
    const electionDoc = await Election.findById(election);
    if (!electionDoc) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidate = await Candidate.create({
      name: name.trim(),
      party: party?.trim() || 'Independent',
      description: description?.trim() || '',
      election
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/candidates/:id — Update candidate (admin)
// Security: Only allow whitelisted fields — prevents tampering with voteCount or election ref
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, party, description } = req.body;

    // Build update object only from whitelisted fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (party !== undefined) updateFields.party = party.trim();
    if (description !== undefined) updateFields.description = description.trim();

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/candidates/:id — Delete candidate (admin)
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
