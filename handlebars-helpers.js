const Handlebars = require('handlebars')

Handlebars.registerHelper('isCurrentPage', function (currentPage, pageNumber, options) {
  if (currentPage !== pageNumber) return
  return 'active'
})