# SEO-Aware Web Crawler

A web crawler built with Node.js, Express, and Playwright that can render SPA, SSR, and PWA websites, then store cleaned HTML snapshots and crawl metadata.

This project is designed as a foundation for SEO-related tools such as meta tag checker, hreflang checker, internal link analyzer, and rendered HTML inspection.

## Tech Stack

- Node.js
- Express.js
- Playwright

## Why Playwright?

Modern websites often rely on JavaScript rendering. A basic HTTP request only returns the initial HTML and may miss rendered content from SPA/PWA websites.

Playwright allows the crawler to:

- render JavaScript-based pages
- wait until the page is loaded
- access the final DOM
- extract SEO-relevant HTML after rendering

## Features

- Crawl rendered web pages
- Support SPA/SSR/PWA pages
- Save cleaned HTML output
- Extract SEO-related data:
  - title
  - meta description
  - robots
  - canonical
  - hreflang
  - Open Graph tags
  - Twitter card tags
  - headings
  - internal links
  - external links
- Store crawl summary as JSON
- Provide POST `/crawl` API endpoint
- Basic URL validation and error handling

## Project Structure

```txt
src/
  controllers/
    crawl.controller.js
  routes/
    crawl.route.js
  services/
    crawler.service.js
  crawler/
    CrawlQueue.js
    fileStorage.js
    pageCrawler.js
    pageExtractor.js
    urlUtils.js
  storage/
    html/

server.js
test-crawl.js
README.md
```

## Installation

```bash
npm install
```

Install Playwright browser:

```bash
npx playwright install
```

## Run Server

```bash
npm run dev
```

Health check:

```bash
GET http://localhost:3000/health
```

## Crawl API

### Endpoint

```http
POST /crawl
```

### Request Body

```json
{
  "url": "https://cmlabs.co/id-id",
  "maxPages": 5,
  "maxDepth": 1,
  "timeoutMs": 30000
}
```

### Example cURL

```bash
curl -X POST http://localhost:3000/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"https://cmlabs.co/id-id","maxPages":5,"maxDepth":1,"timeoutMs":30000}'
```

For Windows Command Prompt:

```cmd
curl -X POST http://localhost:3000/crawl -H "Content-Type: application/json" -d "{\"url\":\"https://cmlabs.co/id-id\",\"maxPages\":5,\"maxDepth\":1,\"timeoutMs\":30000}"
```

### Response Example

```json
{
  "status": "success",
  "startUrl": "https://cmlabs.co/id-id",
  "outputDir": "src/storage/html/cmlabs_co",
  "totalCrawled": 5,
  "pages": [
    {
      "status": "success",
      "url": "https://cmlabs.co/id-id",
      "title": "cmlabs",
      "filePath": "src/storage/html/cmlabs_co/index.html",
      "renderTimeMs": 3200,
      "depth": 0
    }
  ]
}
```

## Manual Test

Run crawler test for multiple websites:

```bash
npm run test:crawl
```

Test targets:

```txt
https://cmlabs.co/id-id
https://sequence.day
https://web.dev
```

The crawled HTML files are stored in:

```txt
src/storage/html/
```

Each website has its own output folder and a `summary.json` file.

## Output

The crawler stores cleaned rendered HTML snapshots.

The HTML output removes runtime and styling noise such as:

- script
- style
- iframe
- canvas
- svg
- noscript

But it preserves SEO-relevant data such as:

- title
- meta description
- canonical
- hreflang
- headings
- links
- rendered body content

## Limitations

- The crawler currently runs sequentially.
- It only crawls pages from the same host.
- It does not use a database.
- It does not perform advanced duplicate content detection.
- Some websites may block headless browsers or require additional handling.
- Large websites should be crawled with page limits to avoid excessive output.

## Future Improvements

- Add robots.txt support
- Add sitemap.xml discovery
- Add crawl concurrency control
- Add retry mechanism
- Add duplicate content detection
- Add SEO scoring
- Add broken link checker
- Add redirect chain tracking
- Add structured data extraction