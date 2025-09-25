const express = require('express');
const { body, validationResult } = require('express-validator');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/admin/elections
 * @desc    Get all elections (including inactive)
 * @access  Private (Admin only)
 */
router.get('/elections', auth, adminAuth, async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(elections);
  } catch (error) {
    console.error('Get admin elections error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/elections
 * @desc    Create a new election
 * @access  Private (Admin only)
 */
router.post('/elections', [
  auth,
  adminAuth,
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, startDate, endDate } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const election = new Election({
      title,
      description,
      startDate: start,
      endDate: end,
      createdBy: req.user._id
    });

    await election.save();
    await election.populate('createdBy', 'name email');

    res.status(201).json(election);
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/elections/:id
 * @desc    Update an election
 * @access  Private (Admin only)
 */
router.put('/elections/:id', [
  auth,
  adminAuth,
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Valid start date required'),
  body('endDate').optional().isISO8601().withMessage('Valid end date required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if election has votes (restrict editing if votes exist)
    const voteCount = await Vote.countDocuments({ election: req.params.id });
    if (voteCount > 0 && (req.body.startDate || req.body.endDate)) {
      return res.status(400).json({ message: 'Cannot modify dates after voting has started' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        election[key] = req.body[key];
      }
    });

    await election.save();
    await election.populate('createdBy', 'name email');

    res.json(election);
  } catch (error) {
    console.error('Update election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/elections/:id
 * @desc    Delete an election
 * @access  Private (Admin only)
 */
router.delete('/elections/:id', auth, adminAuth, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if election has votes
    const voteCount = await Vote.countDocuments({ election: req.params.id });
    if (voteCount > 0) {
      return res.status(400).json({ message: 'Cannot delete election with existing votes' });
    }

    // Delete associated candidates first
    await Candidate.deleteMany({ election: req.params.id });
    
    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Delete election error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/admin/elections/:id/candidates
 * @desc    Add a candidate to an election
 * @access  Private (Admin only)
 */
router.post('/elections/:id/candidates', [
  auth,
  adminAuth,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('party').optional().trim(),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('photo').optional().isURL().withMessage('Photo must be a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const { name, party, description, photo } = req.body;

    const candidate = new Candidate({
      name,
      party: party || 'Independent',
      description: description || '',
      photo: photo || '',
      election: req.params.id
    });

    await candidate.save();

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Add candidate error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Candidate already exists in this election' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/elections/:id/candidates
 * @desc    Get all candidates for an election
 * @access  Private (Admin only)
 */
router.get('/elections/:id/candidates', auth, adminAuth, async (req, res) => {
  try {
    const candidates = await Candidate.find({ election: req.params.id })
      .sort({ name: 1 });

    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/admin/candidates/:id
 * @desc    Update a candidate
 * @access  Private (Admin only)
 */
router.put('/candidates/:id', [
  auth,
  adminAuth,
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('party').optional().trim(),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('photo').optional().isURL().withMessage('Photo must be a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        candidate[key] = req.body[key];
      }
    });

    await candidate.save();

    res.json(candidate);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/admin/candidates/:id
 * @desc    Delete a candidate
 * @access  Private (Admin only)
 */
router.delete('/candidates/:id', auth, adminAuth, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if candidate has votes
    const voteCount = await Vote.countDocuments({ candidate: req.params.id });
    if (voteCount > 0) {
      return res.status(400).json({ message: 'Cannot delete candidate with existing votes' });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ isActive: true });
    const totalVotes = await Vote.countDocuments();
    const totalCandidates = await Candidate.countDocuments();

    res.json({
      users: {
        total: totalUsers,
        voters: totalVoters,
        admins: totalAdmins
      },
      elections: {
        total: totalElections,
        active: activeElections
      },
      votes: totalVotes,
      candidates: totalCandidates
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;