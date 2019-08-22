const Handlebars = require('handlebars')

Handlebars.registerHelper('isCurrentPage', function (currentPage, pageNumber, options) {
  if (currentPage !== pageNumber) return
  return 'active'
})

Handlebars.registerHelper('getSort', function (sortItem, options) {
  if (!sortItem) return
  const sortBy = Object.keys(sortItem)[0]
  return `&sortBy=${sortBy}:${sortItem[sortBy]}`
})

Handlebars.registerHelper('changeOrder', function (order, options) {
  if (!order) return 'DESC'
  return order === 'DESC' ? 'ASC' : 'DESC'
})