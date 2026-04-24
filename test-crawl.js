const fs = require('fs');
const { crawlSite } = require('./src/services/crawler.service');

const targets = [
  'https://cmlabs.co/id-id',
  'https://sequence.day',
  'https://web.dev',
];

(async () => {
  for (const target of targets) {
    console.log(`\nCrawling: ${target}`);

    try {
      const result = await crawlSite(target, {
        maxPages: 3,
        maxDepth: 1,
        timeoutMs: 30000,
        headless: true,
      });

      console.log({
        status: result.status,
        startUrl: result.startUrl,
        totalCrawled: result.totalCrawled,
        outputDir: result.outputDir,
      });

      for (const page of result.pages) {
        const fileExists = page.filePath && fs.existsSync(page.filePath);
        const fileSize = fileExists ? fs.statSync(page.filePath).size : 0;

        console.log({
          url: page.url,
          status: page.status,
          title: page.title,
          filePath: page.filePath,
          fileExists,
          fileSize,
          renderTimeMs: page.renderTimeMs,
        });
      }
    } catch (error) {
      console.error(`Failed: ${target}`);
      console.error(error.message);
    }
  }
})();