const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) { return options.fn(this) }
    return options.inverse(this)
  },
  moment: function (time) {
    return moment(time).fromNow()
  },
  isCurrentPage: function (currentPage, pageNumber, options) {
    if (currentPage !== pageNumber) return
    return 'active'
  },
  getSort: function (sortItem, options) {
    if (!sortItem) return
    const sortBy = Object.keys(sortItem)[0]
    return `&sortBy=${sortBy}:${sortItem[sortBy]}`
  },
  changeOrder: function (order, options) {
    if (!order) return 'DESC'
    return order === 'DESC' ? 'ASC' : 'DESC'
  }
}