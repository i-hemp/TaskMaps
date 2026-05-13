const express = require('express');
const router = express.Router({ mergeParams: true });
const labelController = require('../controllers/labelController');
const auth = require('../middleware/auth');
const requireProjectRole = require('../middleware/rbac');

router.use(auth);
router.use(requireProjectRole(['admin', 'member']));

router.post('/', requireProjectRole(['admin']), labelController.createLabel);
router.get('/', labelController.getProjectLabels);
router.put('/:lid', requireProjectRole(['admin']), labelController.updateLabel);
router.delete('/:lid', requireProjectRole(['admin']), labelController.deleteLabel);

module.exports = router;
