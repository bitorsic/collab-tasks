const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getMyTasks,
  getTask,
  updateTask,
  completeTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
];

// Routes
router.route('/')
  .get(protect, getTasks)
  .post(protect, taskValidation, validate, createTask);

router.get('/my-tasks', protect, getMyTasks);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.put('/:id/complete', protect, completeTask);

module.exports = router;
