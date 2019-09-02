const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

module.exports = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.render('admin/categories', data)
    })
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