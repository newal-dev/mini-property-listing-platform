const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/mine', authenticate, authorize('OWNER'), PropertyController.listMine);
router.get('/', PropertyController.listProperties);
router.post('/', authenticate, authorize('OWNER'), PropertyController.createProperty);
router.patch('/:id/publish', authenticate, authorize('OWNER'), PropertyController.publishProperty);
router.post('/:id/images', authenticate, authorize('OWNER'), upload.single('image'), PropertyController.uploadImage);
router.patch('/:id', authenticate, authorize('OWNER'), PropertyController.updateProperty);
router.get('/admin/all', authenticate, authorize('ADMIN'), PropertyController.listAllForAdmin);
router.patch('/:id/disable', authenticate, authorize('ADMIN'), PropertyController.disableProperty);
router.delete('/:id', authenticate, authorize('OWNER'), PropertyController.deleteProperty);

module.exports = router;