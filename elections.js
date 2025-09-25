const express = require('express');
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const { auth, voterAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/elections
 * @desc    Get all active elections
 * @access  Private (Voter/Admin)
 */
router.get('/', auth, voterAuth, async (req, res) => {
  try {
    const elections = await Election.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });

    res.json(elections);
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/elections/:id
 * @desc    Get election by ID with candidates
 * @access  Private (Voter/Admin)
 */
router.get('/:id', auth, voterAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name');
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ election: req.params.id })
      .sort({ name: 1 });

    res.json({
      election,
      candidates
    });
  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/elections/:id/results
 * @desc    Get election results
 * @access  Private (Voter/Admin)
 */
router.get('/:id/results', auth, voterAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Get candidates with vote counts
    const candidates = await Candidate.find({ election: req.params.id })
      .sort({ voteCount: -1 });

    // Get total votes
    const totalVotes = await Vote.countDocuments({ election: req.params.id });

    // Check if user has voted
    const userVote = await Vote.findOne({ 
      voter: req.user._id, 
      election: req.params.id 
    }).populate('candidate', 'name');

    res.json({
      election,
      candidates,
      totalVotes,
      userVote: userVote ? userVote.candidate : null,
      hasVoted: !!userVote
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/elections/:id/vote
 * @desc    Cast a vote in an election
 * @access  Private (Voter/Admin)
 */
router.post('/:id/vote', [
  auth,
  voterAuth,
  body('candidateId').isMongoId().withMessage('Valid candidate ID required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { candidateId } = req.body;
    const electionId = req.params.id;

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (!election.isActive) {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if election is currently running
    const now = new Date();
    if (now < election.startDate) {
      return res.status(400).json({ message: 'Election has not started yet' });
    }

    if (now > election.endDate) {
      return res.status(400).json({ message: 'Election has ended' });
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in this election' });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ 
      voter: req.user._id, 
      election: electionId 
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Create vote record
    const vote = new Vote({
      voter: req.user._id,
      candidate: candidateId,
      election: electionId
    });

    await vote.save();

    // Update candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    res.status(201).json({ 
      message: 'Vote cast successfully',
      vote: {
        candidate: candidate.name,
        election: election.title,
        timestamp: vote.timestamp
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/elections/:id/check-vote
 * @desc    Check if user has voted in an election
 * @access  Private (Voter/Admin)
 */
router.get('/:id/check-vote', auth, voterAuth, async (req, res) => {
  try {
    const vote = await Vote.findOne({ 
      voter: req.user._id, 
      election: req.params.id 
    }).populate('candidate', 'name');

    res.json({
      hasVoted: !!vote,
      vote: vote ? {
        candidate: vote.candidate.name,
        timestamp: vote.timestamp
      } : null
    });
  } catch (error) {
    console.error('Check vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;