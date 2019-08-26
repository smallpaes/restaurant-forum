const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll()
      return res.render('admin/categories', { categories })
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
    // save category input
    const category = await Category.create({ name: req.body.name })
    req.flash('success_messages', `${category.name} has been added`)
    return res.redirect('/admin/categories')
  }
}