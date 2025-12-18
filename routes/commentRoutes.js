const express = require('express');
const { body } = require('express-validator');
const {
  addComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router({ mergeParams: true });

// Validation rules
const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content is required')
];

// Routes
router.route('/')
  .get(protect, getComments)
  .post(protect, commentValidation, validate, addComment);

router.route('/:id')
  .put(protect, commentValidation, validate, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
