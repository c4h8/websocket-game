class StatCache {
  constructor() {
    this.interval = null;
    this.cache = ([]);
  }

  reset() {
    this.cache = [];
  }

  // add data point
  push(data) {
    this.cache.push(data);
  }

  get() {
    return [...(this.cache)];
  }
}

export default StatCache;
