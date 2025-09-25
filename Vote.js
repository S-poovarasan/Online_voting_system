const mongoose = require('mongoose');

/**
 * Vote Schema
 * Tracks votes with voter, candidate, and election information
 * Ensures one vote per user per election
 */
const voteSchema = new mongoose.Schema({
  voter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per election
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

// Index for efficient queries
voteSchema.index({ election: 1, candidate: 1 });

module.exports = mongoose.model('Vote', voteSchema);