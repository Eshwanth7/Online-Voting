const express = require('express');
const Vote = require('../models/Vote');
const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/votes — Cast a vote
router.post('/', protect, async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // Check if user is verified
    if (!req.user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account before voting' });
    }

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const now = new Date();
    if (!election.isActive || now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: 'This election is not currently active' });
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findById(candidateId);
    if (!candidate || candidate.election.toString() !== electionId) {
      return res.status(400).json({ message: 'Invalid candidate for this election' });
    }

    // Check if user already voted in this election
    const existingVote = await Vote.findOne({ voter: userId, election: electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Cast the vote
    const vote = await Vote.create({
      voter: userId,
      election: electionId,
      candidate: candidateId
    });

    // Increment candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    // Track voted election on user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { votedElections: electionId }
    });

    res.status(201).json({ message: 'Vote cast successfully!' });

  } catch (error) {
    // Handle duplicate vote (compound index)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error while casting vote' });
  }
});

// GET /api/votes/status/:electionId — Check if current user has voted
router.get('/status/:electionId', protect, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      voter: req.user._id,
      election: req.params.electionId
    });

    res.json({ hasVoted: !!vote });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
