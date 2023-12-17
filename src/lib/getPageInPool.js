function getPageInPool(pool, category) {
  const instance = pool.find((p) => p.getCategory() === category);
  return instance.getInstance();
}

module.exports = { getPageInPool };
