const db = require('../models')
const Category = db.Category

module.exports = {
  getCategories: async (req, res) => {
    try {
      const categories = await Category.findAll()
      const category = req.params.id ? categories.find(category => category.id.toString() === req.params.id) : false
      return res.render('admin/categories', { categories, category })
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
  }
}