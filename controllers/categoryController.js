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
  putCategory: (req, res) => {
    categoryService.putCategory(req, res, ({ status, message }) => {
      if (status === 'error') {
        req.flash('error_messages', message)
        return res.redirect('back')
      }
      req.flash('success_messages', message)
      return res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res) => {
    categoryService.deleteCategory(req, res, ({ status, message }) => {
      if (status === 'error') {
        console.log(message)
        return res.redirect('back')
      }
      req.flash('success_messages', message)
      return res.redirect('/admin/categories')
    })
  }
}