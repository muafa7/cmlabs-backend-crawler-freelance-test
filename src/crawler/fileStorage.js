const fs = require('fs/promises');
const path = require('path');

function sanitize(value) {
  return String(value)
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function getSiteOutputDir(startUrl) {
  const hostname = new URL(startUrl).hostname;
  return path.join(__dirname, '../../storage/html', sanitize(hostname));
}

function getFileNameFromUrl(url) {
  const parsed = new URL(url);

  if (parsed.pathname === '/') return 'index.html';

  const name = parsed.pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map(sanitize)
    .filter(Boolean)
    .join('_');

  return `${name || 'index'}.html`;
}

async function saveHtml(outputDir, url, html) {
  await fs.mkdir(outputDir, { recursive: true });

  const fileName = getFileNameFromUrl(url);
  const filePath = path.join(outputDir, fileName);

  await fs.writeFile(filePath, html, 'utf-8');

  return { fileName, filePath };
}

async function saveSummary(outputDir, summary) {
  const filePath = path.join(outputDir, 'summary.json');
  await fs.writeFile(filePath, JSON.stringify(summary, null, 2), 'utf-8');
}

module.exports = {
  getSiteOutputDir,
  saveHtml,
  saveSummary,
};