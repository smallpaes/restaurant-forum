const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const Favorite = db.Favorite
const User = db.User
const restService = require('../services/restService')

module.exports = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('restaurants', data)
    })
  },
  getRestaurant: async (req, res) => {
    try {
      // get restaurant
      let restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: [User] },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ]
      })

      // check if favorite list has the user on it
      const isFavorited = restaurant.FavoritedUsers.filter(user => user.id === req.user.id).length !== 0

      // check if like list has the user on it
      const isLiked = restaurant.LikedUsers.filter(user => user.id === req.user.id).length !== 0

      // update view count
      restaurant = await restaurant.increment('viewCounts', { by: 1 })
      return res.render('restaurant', { restaurant, isFavorited, isLiked, restaurantCSS: true })
    } catch (err) {
      console.log(err)
    }
  },
  getFeeds: async (req, res) => {
    try {
      // find latest restaurants created
      const restaurants = await Restaurant.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [Category]
      })
      // find latest comments created
      const comments = await Comment.findAll({
        order: [['createdAt', 'DESC']],
        limit: 10,
        include: [User, Restaurant]
      })
      return res.render('feeds', { restaurants, comments, displayPanelCSS: true })
    } catch (err) {
      console.log(err)
    }
  },
  getDashboard: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [Comment, Category, { model: User, as: 'FavoritedUsers' }]
      })
      res.render('dashboard', {
        restaurant,
        commentCount: restaurant.Comments.length,
        favoriteUser: restaurant.FavoritedUsers.length
      })
    } catch (err) {
      console.log(err)
    }
  },
  getTopRestaurants: async (req, res) => {
    try {

      // set query based on current mode
      let attributeQuery = ''
      let orderQuery = ''
      if (process.env.isOnHeroku) {
        attributeQuery = '(SELECT COUNT(*) FROM "Favorites" WHERE "Favorites"."RestaurantId" = "Restaurant"."id")'
        orderQuery = '"FavoritedCount" DESC'
      } else {
        attributeQuery = '(SELECT COUNT(*) FROM Favorites WHERE Favorites.RestaurantId = Restaurant.id)'
        orderQuery = 'FavoritedCount DESC'
      }

      let restaurants = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }],
        attributes: [
          [db.sequelize.literal(attributeQuery), 'FavoritedCount'],
          'name',
          'description',
          'image',
          'id'
        ],
        order: db.sequelize.literal(orderQuery),
        limit: 10
      })

      // retrieve needed restaurant info
      restaurants = restaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        image: restaurant.image,
        description: restaurant.description.substring(0, 110) + '...',
        favoriteUser: restaurant.FavoritedUsers.length,
        isFavorite: req.user.FavoritedRestaurants.filter(r => r.id === restaurant.id).length !== 0
      }))

      return res.render('topRestaurant', { restaurants, displayPanelCSS: true })
    } catch (err) {
      console.log(err)
    }
  }
}