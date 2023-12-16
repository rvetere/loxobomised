function getPageInPool(pool, room) {
  const instance = pool.find((p) => p.getRoom() === room);
  return instance.getInstance();
}

module.exports = { getPageInPool };
