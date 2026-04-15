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

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: 'Election ID and candidate ID are required' });
    }

    // Check if user is verified
    if (!req.user.isVerified) {
      return res.status(403).json({ message: 'Please verify your account before voting' });
    }

    // Check if election exists and is currently active
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

    // Check if user already voted (before creating the vote document)
    const existingVote = await Vote.findOne({ voter: userId, election: electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // ── Atomic-safe vote creation ─────────────────────────────────────────────
    // Step 1: Create the Vote document first. If this fails, voteCount is NOT touched.
    // Step 2: Only then increment voteCount and update votedElections.
    // This prevents voteCount from being dirty if vote creation fails.

    const vote = await Vote.create({
      voter: userId,
      election: electionId,
      candidate: candidateId
    });

    // Step 2: Both updates proceed now that the vote is confirmed
    await Promise.all([
      Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } }),
      User.findByIdAndUpdate(userId, { $addToSet: { votedElections: electionId } })
    ]);

    res.status(201).json({ message: 'Vote cast successfully!' });

  } catch (error) {
    // MongoDB compound unique index catches race-condition double votes
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
