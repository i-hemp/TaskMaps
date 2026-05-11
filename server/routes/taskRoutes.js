const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/rbac');

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

module.exports = router;
