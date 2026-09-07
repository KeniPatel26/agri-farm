const express = require('express');
const router = express.Router();
const { getWeather } = require('../controller/weatherController');

router.get('/', getWeather);

module.exports = router;
