const express = require('express');
const crawlRoute = require('./routes/crawl.route');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Crawler service is running',
  });
});

app.use('/', crawlRoute);

module.exports = app;