const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const favoriteController = require('../controllers/favoriteController');

router.post('/:id', authenticate, authorize('USER'), favoriteController.addFavorite);
router.delete('/:id', authenticate, authorize('USER'), favoriteController.removeFavorite);

module.exports = router;