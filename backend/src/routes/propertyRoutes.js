const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/propertyController');

router.get('/', PropertyController.listProperties);

module.exports = router;