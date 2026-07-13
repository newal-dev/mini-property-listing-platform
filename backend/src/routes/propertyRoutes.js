const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.get('/', PropertyController.listProperties);
router.post('/', authenticate, authorize('OWNER'), PropertyController.createProperty);
router.patch('/:id/publish', authenticate, authorize('OWNER'), PropertyController.publishProperty);
router.post('/:id/images', authenticate, authorize('OWNER'), upload.single('image'), PropertyController.uploadImage);
router.patch('/:id', authenticate, authorize('OWNER'), PropertyController.updateProperty);

module.exports = router;