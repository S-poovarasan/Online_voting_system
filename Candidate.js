const mongoose = require('mongoose');

/**
 * Candidate Schema
 * Represents candidates in elections
 */
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  party: {
    type: String,
    trim: true,
    default: 'Independent'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  photo: {
    type: String, // URL to candidate photo
    default: ''
  },
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  voteCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure unique candidates per election
candidateSchema.index({ name: 1, election: 1 }, { unique: true });

module.exports = mongoose.model('Candidate', candidateSchema);