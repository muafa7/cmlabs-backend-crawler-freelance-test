const { chromium } = require('playwright');

const CrawlQueue = require('../crawler/CrawlQueue');
const { crawlPage } = require('../crawler/pageCrawler');
const { normalizeUrl } = require('../crawler/urlUtils');
const { getSiteOutputDir, saveSummary } = require('../crawler/fileStorage');

async function crawlSite(startUrl, userOptions = {}) {
  const options = {
    maxPages: 5,
    maxDepth: 1,
    timeoutMs: 30000,
    headless: true,
    ...userOptions,
  };

  const normalizedStartUrl = normalizeUrl(startUrl);
  const outputDir = getSiteOutputDir(normalizedStartUrl);

  const queue = new CrawlQueue();
  const results = [];

  queue.enqueue(normalizedStartUrl, 0);

  const browser = await chromium.launch({
    headless: options.headless,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    while (queue.hasNext() && results.length < options.maxPages) {
      const current = queue.dequeue();

      try {
        const result = await crawlPage(
          page,
          current.url,
          normalizedStartUrl,
          outputDir,
          options
        );

        results.push({
          status: result.status,
          url: result.url,
          title: result.title,
          h1: result.h1,
          textSnippet: result.textSnippet,
          fileName: result.fileName,
          filePath: result.filePath,
          renderTimeMs: result.renderTimeMs,
          depth: current.depth,
          discoveredLinksCount: result.discoveredLinks.length,
          seo: result.seo,
        });

        if (current.depth < options.maxDepth) {
          for (const link of result.discoveredLinks) {
            queue.enqueue(link, current.depth + 1);
          }
        }
      } catch (error) {
        results.push({
          status: 'error',
          url: current.url,
          title: '',
          fileName: null,
          filePath: null,
          renderTimeMs: 0,
          depth: current.depth,
          error: error.message,
        });
      }
    }

    const summary = {
      status: 'success',
      startUrl: normalizedStartUrl,
      outputDir,
      totalCrawled: results.length,
      pages: results,
    };

    await saveSummary(outputDir, summary);

    return {
      status: 'success',
      startUrl: normalizedStartUrl,
      outputDir,
      totalCrawled: results.length,
      pages: results.map((page) => ({
        status: page.status,
        url: page.url,
        title: page.title,
        filePath: page.filePath,
        renderTimeMs: page.renderTimeMs,
        depth: page.depth,
      })),
    };
  } finally {
    await browser.close();
  }
}

module.exports = {
  crawlSite,
};