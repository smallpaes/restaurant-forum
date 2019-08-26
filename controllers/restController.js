const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

module.exports = {
  getRestaurants: async (req, res) => {
    const whereQuery = {}
    let categoryId = ''
    // check if any category is selected
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['categoryId'] = categoryId
    }

    try {
      const restaurants = await Restaurant.findAll({ include: Category, where: whereQuery })
      const categories = await Category.findAll()
      const data = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50)
      }))
      return res.render('restaurants', {
        restaurants: data,
        categories,
        categoryId
      })
    } catch (err) {
      console.log(err)
    }
    return res.render('restaurants')
  },
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: Category })
      return res.render('restaurant', { restaurant })
    } catch (err) {
      console.log(err)
    }
  }
}