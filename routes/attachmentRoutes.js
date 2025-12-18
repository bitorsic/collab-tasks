const express = require('express');
const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router({ mergeParams: true });

// Routes
router.route('/')
  .get(protect, getAttachments)
  .post(protect, upload.single('file'), uploadAttachment);

router.route('/:id')
  .delete(protect, deleteAttachment);

router.get('/:id/download', protect, downloadAttachment);

module.exports = router;
