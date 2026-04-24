const TRACKING_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
];

const ASSET_FILE_PATTERN =
  /\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|zip|rar|mp4|mp3|doc|docx|xls|xlsx|ppt|pptx|css|js|json|xml)$/i;

function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);

  url.hash = '';

  for (const param of TRACKING_PARAMS) {
    url.searchParams.delete(param);
  }

  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

function isSameHost(url, startUrl) {
  return new URL(url).hostname === new URL(startUrl).hostname;
}

function shouldCrawlUrl(url, startUrl) {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (!isSameHost(url, startUrl)) return false;
    if (ASSET_FILE_PATTERN.test(parsed.pathname)) return false;

    return true;
  } catch {
    return false;
  }
}

module.exports = {
  normalizeUrl,
  shouldCrawlUrl,
};