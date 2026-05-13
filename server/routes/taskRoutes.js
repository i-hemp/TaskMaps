const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/rbac');
const upload = require('../middleware/upload');

// All task routes require authentication and project membership
router.use(auth);
router.use(requireProjectRole(['admin', 'member']));

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);

router.get('/:tid', taskController.getTaskById);
router.put('/:tid', taskController.updateTask);
router.delete('/:tid', requireProjectRole(['admin']), taskController.deleteTask);

// Comments
router.post('/:tid/comments', taskController.addComment);

// Attachments
router.post('/:tid/attachments', upload.single('file'), taskController.uploadAttachment);
router.delete('/:tid/attachments/:aid', taskController.deleteAttachment);

module.exports = router;
