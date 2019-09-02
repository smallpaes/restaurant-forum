const db = require('../models')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const Restaurant = db.Restaurant
const Category = db.Category
const { getOrder, getPagination, getPaginationInfo } = require('../tools')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const ITEMS_PER_PAGE = 10

module.exports = {
  getRestaurants: async (req, res, callback) => {
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
  },
  postRestaurant: async (req, res, callback) => {
    // check if name is provided
    if (!req.body.name) {
      return callback({ status: 'error', message: 'Name is required' })
    }
    // create restaurant
    try {
      if (req.file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(req.file.path, async (err, img) => {
          await Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: req.file ? img.data.link : null,
            CategoryId: req.body.categoryId,
            viewCounts: 0
          })
          return callback({ status: 'success', message: 'restaurant is created successfully' })
        })
      } else {
        await Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: null,
          CategoryId: req.body.categoryId,
          viewCounts: 0
        })
        return callback({ status: 'success', message: 'restaurant is created successfully' })
      }
    } catch (err) {
      callback({ status: 'error', message: err })
    }

  },
  putRestaurant: async (req, res, callback) => {
    // get page number
    const page = req.query.page

    // check if name is provided
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name is required' })
    }

    try {
      if (req.file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(req.file.path, async (err, img) => {
          // update restaurant info
          const restaurant = await Restaurant.findByPk(req.params.id)
          await restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: req.file ? img.data.link : restaurant.image,
            CategoryId: req.body.categoryId
          })
          // send success message
          return callback({ status: 'success', message: 'restaurant is updated successfully' })
        })
      } else {
        // update restaurant info
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: restaurant.image,
          CategoryId: req.body.categoryId
        })
        // send success message
        return callback({ status: 'success', message: 'restaurant is updated successfully' })
      }
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
  getRestaurant: async (req, res, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: [Category] })
      callback({ restaurant })
    } catch (err) {
      console.log(err)
    }
  },
  deleteRestaurant: async (req, res, callback) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      // delete restaurant
      await restaurant.destroy()
      callback({ status: 'success', message: '' })
    } catch (err) {
      console.log(err)
    }
  }
}