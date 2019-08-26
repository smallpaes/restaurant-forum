const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

module.exports = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({ include: Category })
      const data = restaurants.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50)
      }))
      return res.render('restaurants', { restaurants: data })
    } catch (err) {
      console.log(err)
    }


    return res.render('restaurants')
  }
}