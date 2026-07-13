const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', PropertyController.listProperties);
router.post('/', authenticate, authorize('OWNER'), PropertyController.createProperty);
router.patch('/:id/publish', authenticate, authorize('OWNER'), PropertyController.publishProperty);

module.exports = router;