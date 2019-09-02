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
      const category = req.params.id ? categories.rows.filter(category => category.id.toString() === req.params.id)[0] : false

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
  putCategory: async (req, res, callback) => {
    // check if the input is empty
    if (!req.body.name) {
      callback({ status: 'error', message: 'category name is requires' })
    }
    // update category name
    try {
      const category = await Category.findByPk(req.params.id)
      const updatedCategory = await category.update(req.body)
      callback({ status: 'success', message: `${category.name} has been changed into ${updatedCategory.name}` })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
  deleteCategory: async (req, res, callback) => {
    try {
      // find the category
      const category = await Category.findByPk(req.params.id)
      // delete the category
      await category.destroy()
      callback({ status: 'success', message: `${category.name} has been deleted!` })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  }
}