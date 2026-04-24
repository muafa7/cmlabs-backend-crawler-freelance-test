const { crawlSite } = require('../services/crawler.service');

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

async function crawlController(req, res) {
  try {
    const { url, maxPages, maxDepth, timeoutMs } = req.body;

    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required',
      });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid URL',
      });
    }

    const result = await crawlSite(url, {
      maxPages: maxPages || 1,
      maxDepth: maxDepth || 0,
      timeoutMs: timeoutMs || 30000,
      headless: true,
    });

    return res.status(200).json(result);
  } catch (error) {
    const isTimeout = error.message.toLowerCase().includes('timeout');

    return res.status(isTimeout ? 408 : 500).json({
      status: 'error',
      message: isTimeout ? 'Crawl timeout' : 'Failed to crawl website',
      detail: error.message,
    });
  }
}

module.exports = {
  crawlController,
};