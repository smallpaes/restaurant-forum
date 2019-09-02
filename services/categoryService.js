const db = require('../models')
const Category = db.Category
const { getPaginationInfo, getPagination } = require('../tools')
const ITEMS_PER_PAGE = 10

module.exports = {
  getCategories: async (req, res, callback) => {
    try {
      // handle pagination
      const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

      // find categories and total amount
      const categories = await Category.findAndCountAll({ ...limiting })

      // generate an array based on the number of total pages
      const pagination = getPagination(categories.count, ITEMS_PER_PAGE)

      // find the category when user is trying to update
      const category = req.params.id ? categories.find(category => category.id.toString() === req.params.id) : false

      callback({
        categories: categories.rows,
        category,
        pagination,
        currentPage: page,
        nextPage: page + 1,
        lastPage: page - 1,
        hasLastPage: page !== 1,
        hasNextPage: Math.ceil(categories.count / ITEMS_PER_PAGE) !== page,
      })
    } catch (err) {
      console.log(err)
    }
  },
  postCategory: async (req, res, callback) => {
    // show error message for empty input
    if (!req.body.name) {
      callback({ status: 'error', message: 'category name is required' })
    }
    // save category
    try {
      // save category input
      const category = await Category.create({ name: req.body.name })
      callback({ status: 'success', message: `${category.name} has been added` })
    } catch {
      callback({ status: 'error', message: err })
    }
  },
}