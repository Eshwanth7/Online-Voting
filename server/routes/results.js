const express = require('express');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/results/:electionId — Get results for an election
router.get('/:electionId', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get candidates with vote counts
    const candidates = await Candidate.find({ election: req.params.electionId })
      .sort({ voteCount: -1 });

    // Total votes
    const totalVotes = await Vote.countDocuments({ election: req.params.electionId });

    // Build results
    const results = candidates.map(candidate => ({
      candidateId: candidate._id,
      name: candidate.name,
      party: candidate.party,
      voteCount: candidate.voteCount,
      percentage: totalVotes > 0
        ? ((candidate.voteCount / totalVotes) * 100).toFixed(1)
        : '0.0'
    }));

    res.json({
      election: {
        id: election._id,
        title: election.title,
        startDate: election.startDate,
        endDate: election.endDate,
        isActive: election.isActive
      },
      totalVotes,
      results
    });

  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
