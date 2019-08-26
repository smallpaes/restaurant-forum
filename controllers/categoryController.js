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
  }
}