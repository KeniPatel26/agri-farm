const express = require('express');
const router = express.Router();
const { updateLocation, getNearbyUsers, getNearbyMarkets } = require('../controller/locationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.put('/update', updateLocation);
router.get('/nearby', getNearbyUsers);
router.get('/nearby-markets', getNearbyMarkets);

module.exports = router;
