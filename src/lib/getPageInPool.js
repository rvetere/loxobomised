async function getPageInPool(pool, room) {
  const instance = pool.find((p) => p.getRoom() === room);
  const page = await instance.getInstance();
}

module.exports = { getPageInPool };
