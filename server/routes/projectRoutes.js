const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/rbac');

// All project routes require authentication
router.use(auth);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);

router.get('/:id', requireProjectRole(['admin', 'member']), projectController.getProjectById);
router.put('/:id', requireProjectRole(['admin']), projectController.updateProject);
router.delete('/:id', requireProjectRole(['admin']), projectController.deleteProject);

// Member management
router.post('/:id/members', requireProjectRole(['admin']), projectController.addMember);
router.delete('/:id/members/:userId', requireProjectRole(['admin']), projectController.removeMember);

module.exports = router;
