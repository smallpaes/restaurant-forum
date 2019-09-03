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
}