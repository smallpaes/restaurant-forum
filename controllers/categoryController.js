const db = require('../models')
const Category = db.Category
const { getPaginationInfo, getPagination } = require('../tools')
const ITEMS_PER_PAGE = 10

module.exports = {
  getCategories: async (req, res) => {
    try {
      // handle pagination
      const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

      // find categories and total amount
      const categories = await Category.findAndCountAll({ ...limiting })

      // generate an array based on the number of total pages
      const pagination = getPagination(categories.count, ITEMS_PER_PAGE)

      // find the category when user is trying to update
      const category = req.params.id ? categories.find(category => category.id.toString() === req.params.id) : false

      return res.render('admin/categories', {
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
  postCategory: async (req, res) => {
    // show error message for empty input
    if (!req.body.name) {
      req.flash('error_messages', 'category name is required')
      return res.redirect('back')
    }
    // save category
    try {
      // save category input
      const category = await Category.create({ name: req.body.name })
      req.flash('success_messages', `${category.name} has been added`)
      return res.redirect('/admin/categories')
    } catch {
      console.log(err)
    }
  },
  putCategory: async (req, res) => {
    // check if the input is empty
    if (!req.body.name) {
      req.flash('error_messages', 'category name is requires')
      return res.redirect('back')
    }
    // update category name
    try {
      const category = await Category.findByPk(req.params.id)
      const updatedCategory = await category.update(req.body)
      req.flash('success_messages', `${category.name} has been changed into ${updatedCategory.name}`)
      return res.redirect('/admin/categories')
    } catch (err) {
      console.log(err)
    }
  },
  deleteCategory: async (req, res) => {
    try {
      // find the category
      const category = await Category.findByPk(req.params.id)
      // delete the category
      await category.destroy()
      req.flash('success_messages', `${category.name} has been deleted!`)
      return res.redirect('/admin/categories')
    } catch (err) {
      console.log(err)
    }
  }
}