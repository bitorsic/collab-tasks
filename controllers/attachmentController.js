const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const fs = require('fs').promises;
const path = require('path');

/**
 * @desc    Upload attachment to task
 * @route   POST /api/tasks/:taskId/attachments
 * @access  Private
 */
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Create attachment
    const attachment = await Attachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      task: taskId,
      uploadedBy: req.user.id
    });

    // Add attachment to task
    task.attachments.push(attachment._id);
    await task.save();

    const populatedAttachment = await Attachment.findById(attachment._id)
      .populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedAttachment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all attachments for a task
 * @route   GET /api/tasks/:taskId/attachments
 * @access  Private
 */
exports.getAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const attachments = await Attachment.find({ task: taskId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attachments.length,
      data: attachments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Download attachment
 * @route   GET /api/attachments/:id/download
 * @access  Private
 */
exports.downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(attachment.path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);

    // Send file
    res.sendFile(path.resolve(attachment.path));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete attachment
 * @route   DELETE /api/attachments/:id
 * @access  Private
 */
exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not found'
      });
    }

    // Check if user uploaded the attachment or is admin
    if (attachment.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this attachment'
      });
    }

    // Remove attachment from task
    await Task.findByIdAndUpdate(attachment.task, {
      $pull: { attachments: attachment._id }
    });

    // Delete file from filesystem
    try {
      await fs.unlink(attachment.path);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await attachment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
