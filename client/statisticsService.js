class StatCache {
  interval = null;
  cache = ([]);

  clear() {
    this.cache = []
  }

  // add data point
  push(data) {
    this.cache.push(data)
  }

  get() {
    return [... this.cache]
  }
}

export default StatCache;
