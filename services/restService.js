const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const Favorite = db.Favorite
const User = db.User
const { getPagination, getPaginationInfo } = require('../tools')
const ITEMS_PER_PAGE = 10

module.exports = {
  getRestaurants: async (req, res, callback) => {
    const whereQuery = {}
    let categoryId = ''
    // check if any category is selected
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery['CategoryId'] = categoryId
    }

    // handle pagination
    const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

    try {
      const restaurants = await Restaurant.findAndCountAll({ include: Category, where: whereQuery, ...limiting })
      const categories = await Category.findAll()

      const data = restaurants.rows.map(restaurant => ({
        ...restaurant.dataValues,
        description: restaurant.dataValues.description.substring(0, 50),
        isFavorited: req.user.FavoritedRestaurants.filter(d => d.id === restaurant.id).length !== 0,
        isLiked: req.user.LikedRestaurants.filter(d => d.id === restaurant.id).length !== 0
      }))

      // generate an array based on the number of total pages
      const pagination = getPagination(restaurants.count, ITEMS_PER_PAGE)

      callback({
        restaurants: data,
        categories,
        categoryId,
        pagination,
        currentPage: page,
        nextPage: page + 1,
        lastPage: page - 1,
        hasLastPage: page !== 1,
        hasNextPage: Math.ceil(restaurants.count / ITEMS_PER_PAGE) !== page,
        displayPanelCSS: true
      })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
  getRestaurant: async (req, res, callback) => {
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

      return callback({ status: 'success', restaurant, isFavorited, isLiked, restaurantCSS: true })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
  getFeeds: async (req, res, callback) => {
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
      return callback({ status: 'success', restaurants, comments, displayPanelCSS: true })
    } catch (err) {
      return callback({ status: 'error', message: err })
    }
  },
  getDashboard: async (req, res, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [Comment, Category, { model: User, as: 'FavoritedUsers' }]
      })
      callback({
        status: 'success',
        restaurant,
        commentCount: restaurant.Comments.length,
        favoriteUser: restaurant.FavoritedUsers.length
      })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
}