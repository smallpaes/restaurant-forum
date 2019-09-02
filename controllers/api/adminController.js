const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const adminService = require('../../services/adminService')

module.exports = {
  getRestaurants: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.json(data)
    })
  }
}