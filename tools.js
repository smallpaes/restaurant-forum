module.exports = {
  getOrder: sortBy => {
    const order = []
    if (sortBy) { order.push([sortBy.split(':')[0], sortBy.split(':')[1]]) }
    return order
  },
  getPaginationInfo: (ITEMS_PER_PAGE, pageNumber = 1) => {
    const page = parseInt(pageNumber)
    const limiting = page === 1 ? { limit: ITEMS_PER_PAGE } : { offset: ITEMS_PER_PAGE * (page - 1), limit: ITEMS_PER_PAGE }
    return { ITEMS_PER_PAGE, page, limiting }
  },
  getPagination: (totalPage, ITEMS_PER_PAGE) => {
    return Array.from({ length: Math.ceil(totalPage / ITEMS_PER_PAGE) }, (v, i) => i + 1)
  }
}