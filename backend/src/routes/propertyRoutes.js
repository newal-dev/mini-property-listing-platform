const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', PropertyController.listProperties);
router.post('/', authenticate, authorize('OWNER'), PropertyController.createProperty);

module.exports = router;