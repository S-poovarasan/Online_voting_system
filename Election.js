const mongoose = require('mongoose');

/**
 * Election Schema
 * Manages voting elections with start/end times
 */
const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Election description is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual to check if election is currently running
electionSchema.virtual('isRunning').get(function() {
  const now = new Date();
  return this.isActive && now >= this.startDate && now <= this.endDate;
});

// Virtual to check if election has ended
electionSchema.virtual('hasEnded').get(function() {
  const now = new Date();
  return now > this.endDate;
});

// Ensure virtual fields are serialized
electionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Election', electionSchema);