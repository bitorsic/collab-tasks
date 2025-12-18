const Task = require('../models/Task');
const User = require('../models/User');
const Team = require('../models/Team');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, team, priority, tags } = req.body;

    // Verify assigned user exists if provided
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Verify team exists if provided
    if (team) {
      const teamDoc = await Team.findById(team);
      if (!teamDoc) {
        return res.status(404).json({
          success: false,
          message: 'Team not found'
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo,
      team,
      priority,
      tags,
      createdBy: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all tasks (with filtering, sorting, searching)
 * @route   GET /api/tasks
 * @access  Private
 */
exports.getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedTo,
      createdBy,
      team,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Filter by creator
    if (createdBy) {
      query.createdBy = createdBy;
    }

    // Filter by team
    if (team) {
      query.team = team;
    }

    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Execute query
    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get tasks assigned to me
 * @route   GET /api/tasks/my-tasks
 * @access  Private
 */
exports.getMyTasks = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { assignedTo: req.user.id };

    if (status) {
      query.status = status;
    }

    const sortOrder = order === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('team', 'name')
      .sort({ [sortBy]: sortOrder });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name email' }
      })
      .populate({
        path: 'attachments',
        populate: { path: 'uploadedBy', select: 'name email' }
      });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is creator or assigned user
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Mark task as completed
 * @route   PUT /api/tasks/:id/complete
 * @access  Private
 */
exports.completeTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to task
    if (
      task.assignedTo?.toString() !== req.user.id &&
      task.createdBy.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this task'
      });
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('team', 'name');

    res.status(200).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is creator or admin
    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
