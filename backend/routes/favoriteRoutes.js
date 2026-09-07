const express = require('express');
const router = express.Router();
const { addFavorite, getFavorites, deleteFavorite } = require('../controller/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(addFavorite)
  .get(getFavorites);

router.route('/:targetId')
  .delete(deleteFavorite);

module.exports = router;
