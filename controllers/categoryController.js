const db = require('../models')
const Category = db.Category
const categoryService = require('../services/categoryService')

module.exports = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, data => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res) => {
    categoryService.postCategory(req, res, ({ status, message }) => {
      if (status === 'error') {
        req.flash('error_messages', message)
        return res.redirect('back')
      }
      req.flash('success_messages', message)
      return res.redirect('/admin/categories')
    })
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