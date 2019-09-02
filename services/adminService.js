const db = require('../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Restaurant = db.Restaurant
const Category = db.Category
const { getOrder, getPagination, getPaginationInfo } = require('../tools')
const ITEMS_PER_PAGE = 10

module.exports = {
  getRestaurant: async (req, res, callback) => {
    // get order criteria
    const order = getOrder(req.query.sortBy)

    // save user search input
    const searchInput = req.query.name || ''

    // handle pagination
    const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

    // find certain restaurants and count all restaurants
    const restaurants = await Restaurant.findAndCountAll({
      where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('Restaurant.name')), 'LIKE', `%${searchInput.toLowerCase()}%`),
      order,
      ...limiting,
      include: [Category]
    })

    // generate an array based on the number of total pages
    const pagination = getPagination(restaurants.count, ITEMS_PER_PAGE)

    callback({
      restaurants: restaurants.rows,
      pagination,
      currentPage: page,
      nextPage: page + 1,
      lastPage: page - 1,
      hasLastPage: page !== 1,
      hasNextPage: Math.ceil(restaurants.count / ITEMS_PER_PAGE) !== page,
      searchInput,
      sortBy: !order.length ? false : { [order[0][0]]: order[0][1] },
      sortName: !order.length ? false : order[0][0] === 'name' ? order[0][1] : false,
      sortId: !order.length ? false : order[0][0] === 'id' ? order[0][1] : false
    })

  }
}