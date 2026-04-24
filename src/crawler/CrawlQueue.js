class CrawlQueue {
  constructor() {
    this.items = [];
    this.seen = new Set();
  }

  enqueue(url, depth = 0) {
    if (this.seen.has(url)) return false;

    this.items.push({ url, depth });
    this.seen.add(url);

    return true;
  }

  dequeue() {
    return this.items.shift();
  }

  hasNext() {
    return this.items.length > 0;
  }

  has(url) {
    return this.seen.has(url);
  }
}

module.exports = CrawlQueue;