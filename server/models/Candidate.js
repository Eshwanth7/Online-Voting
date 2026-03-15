const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true
  },
  party: {
    type: String,
    trim: true,
    default: 'Independent'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: [true, 'Election reference is required']
  },
  voteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
