const { normalizeUrl, shouldCrawlUrl } = require('./urlUtils');

async function extractPageData(page, currentUrl, startUrl) {
  const seoData = await page.evaluate(() => {
    const getMetaByName = (name) => {
      const el = document.querySelector(`meta[name="${name}"]`);
      return el?.getAttribute('content') || '';
    };

    const getMetaByProperty = (property) => {
      const el = document.querySelector(`meta[property="${property}"]`);
      return el?.getAttribute('content') || '';
    };

    const title = document.title || '';

    const description = getMetaByName('description');
    const robots = getMetaByName('robots');

    const canonical =
      document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

    const hreflangs = Array.from(
      document.querySelectorAll('link[rel="alternate"][hreflang]')
    ).map((el) => ({
      hreflang: el.getAttribute('hreflang') || '',
      href: el.getAttribute('href') || '',
    }));

    const openGraph = {
      title: getMetaByProperty('og:title'),
      description: getMetaByProperty('og:description'),
      url: getMetaByProperty('og:url'),
      image: getMetaByProperty('og:image'),
      type: getMetaByProperty('og:type'),
    };

    const twitter = {
      card: getMetaByName('twitter:card'),
      title: getMetaByName('twitter:title'),
      description: getMetaByName('twitter:description'),
      image: getMetaByName('twitter:image'),
    };

    const headings = {
      h1: Array.from(document.querySelectorAll('h1'))
        .map((el) => el.textContent.trim())
        .filter(Boolean),

      h2: Array.from(document.querySelectorAll('h2'))
        .map((el) => el.textContent.trim())
        .filter(Boolean),

      h3: Array.from(document.querySelectorAll('h3'))
        .map((el) => el.textContent.trim())
        .filter(Boolean),
    };

    const rawLinks = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({
        href: a.getAttribute('href'),
        text: a.textContent.trim().replace(/\s+/g, ' '),
      }))
      .filter((link) => link.href);

    const bodyClone = document.body ? document.body.cloneNode(true) : null;

    if (bodyClone) {
      bodyClone
        .querySelectorAll(`
          script,
          style,
          noscript,
          template,
          svg,
          canvas,
          iframe
        `)
        .forEach((el) => el.remove());
    }

    const main = bodyClone?.querySelector('main') || bodyClone;

    const cleanBodyHtml = main ? main.innerHTML : '';

    const textContent = main
      ? main.textContent.replace(/\s+/g, ' ').trim()
      : '';

    const cleanHtml = `
<!doctype html>
<html lang="${document.documentElement.lang || ''}">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${description ? `<meta name="description" content="${description}">` : ''}
  ${robots ? `<meta name="robots" content="${robots}">` : ''}
  ${canonical ? `<link rel="canonical" href="${canonical}">` : ''}
  ${hreflangs
    .map(
      (item) =>
        `<link rel="alternate" hreflang="${item.hreflang}" href="${item.href}">`
    )
    .join('\n  ')}
</head>
<body>
${cleanBodyHtml}
</body>
</html>`.trim();

    return {
      title,
      description,
      robots,
      canonical,
      hreflangs,
      openGraph,
      twitter,
      headings,
      rawLinks,
      textContent,
      cleanHtml,
    };
  });

  const links = seoData.rawLinks
    .map((link) => {
      try {
        const absoluteUrl = normalizeUrl(new URL(link.href, currentUrl).toString());

        return {
          url: absoluteUrl,
          text: link.text,
          type:
            new URL(absoluteUrl).hostname === new URL(startUrl).hostname
              ? 'internal'
              : 'external',
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const internalLinks = links.filter((link) => link.type === 'internal');
  const externalLinks = links.filter((link) => link.type === 'external');

  const discoveredLinks = [...new Set(
    internalLinks
      .map((link) => link.url)
      .filter((url) => shouldCrawlUrl(url, startUrl))
  )];

  return {
    title: seoData.title,
    html: seoData.cleanHtml,

    seo: {
      description: seoData.description,
      robots: seoData.robots,
      canonical: seoData.canonical,
      hreflangs: seoData.hreflangs,
      openGraph: seoData.openGraph,
      twitter: seoData.twitter,
      headings: seoData.headings,
      internalLinks,
      externalLinks,
      textSnippet: seoData.textContent.slice(0, 500),
    },

    discoveredLinks,
  };
}

module.exports = {
  extractPageData,
};