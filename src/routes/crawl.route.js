const express = require('express');
const { crawlController } = require('../controllers/crawl.controller');

const router = express.Router();

router.post('/crawl', crawlController);

module.exports = router;