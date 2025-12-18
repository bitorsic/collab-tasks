const express = require('express');
const { body } = require('express-validator');
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  addMember,
  removeMember,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const teamValidation = [
  body('name').trim().notEmpty().withMessage('Team name is required')
];

const addMemberValidation = [
  body('userId').notEmpty().withMessage('User ID is required')
];

// Routes
router.route('/')
  .get(protect, getTeams)
  .post(protect, teamValidation, validate, createTeam);

router.route('/:id')
  .get(protect, getTeam)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.post('/:id/members', protect, addMemberValidation, validate, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
