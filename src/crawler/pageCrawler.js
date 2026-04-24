const { extractPageData } = require('./pageExtractor');
const { saveHtml } = require('./fileStorage');

async function crawlPage(page, currentUrl, startUrl, outputDir, options = {}) {
  const startedAt = Date.now();

  await page.goto(currentUrl, {
    waitUntil: 'domcontentloaded',
    timeout: options.timeoutMs || 30000,
  });

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1000).catch(() => {});

  const data = await extractPageData(page, currentUrl, startUrl);
  const saved = await saveHtml(outputDir, currentUrl, data.html);

  return {
    status: 'success',
    url: currentUrl,
    title: data.title,
    fileName: saved.fileName,
    filePath: saved.filePath,
    renderTimeMs: Date.now() - startedAt,

    seo: data.seo,

    discoveredLinks: data.discoveredLinks,
  };
}

module.exports = {
  crawlPage,
};