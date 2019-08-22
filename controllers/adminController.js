const fs = require('fs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

module.exports = {
  getRestaurants: async (req, res) => {
    // save sort criteria
    const order = []
    const sortBy = req.query.sortBy || null
    if (sortBy) { order.push([sortBy.split(':')[0], sortBy.split(':')[1]]) }

    // save user search input
    const searchInput = req.query.name || ''

    // handle pagination
    const ITEMS_PER_PAGE = 10
    const page = parseInt(req.query.page) || 1
    const limiting = page === 1 ? { limit: ITEMS_PER_PAGE } : { offset: ITEMS_PER_PAGE * (page - 1), limit: ITEMS_PER_PAGE }

    // find certain restaurants and count all restaurants
    const restaurants = await Restaurant.findAndCountAll({
      where: { name: { [Op.like]: `%${searchInput}%` } },
      order,
      ...limiting
    })

    // generate an array based on the number of total pages
    const pagination = Array.from({ length: Math.ceil(restaurants.count / ITEMS_PER_PAGE) }, (v, i) => i + 1)

    res.render('admin/restaurants', {
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
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: async (req, res) => {
    // check if name is provided
    if (!req.body.name) {
      req.flash('error_messages', 'Name is required')
      res.redirect('back')
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
            image: req.file ? img.data.link : null
          })
          req.flash('success_messages', 'restaurant is created successfully')
          return res.redirect('/admin/restaurants')
        })
      } else {
        await Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: null
        })
        req.flash('success_messages', 'restaurant is created successfully')
        res.redirect('/admin/restaurants')
      }

    } catch (err) {
      console.log(err)
    }

  },
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      return res.render('admin/restaurant', { restaurant })
    } catch (err) {
      console.log(err)
    }
  },
  editRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      return res.render('admin/create', { restaurant })
    } catch (err) {
      console.log(err)
    }
  },
  putRestaurant: async (req, res) => {
    // check if name is provided
    if (!req.body.name) {
      req.flash('error_messages', 'name is required')
      res.redirect('back')
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
            image: req.file ? img.data.link : restaurant.image
          })
          // send flash message
          req.flash('success_messages', 'restaurant is updated successfully')
          res.redirect('/admin/restaurants')
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
          image: restaurant.image
        })
        // send flash message
        req.flash('success_messages', 'restaurant is updated successfully')
        return res.redirect('/admin/restaurants')
      }
    } catch (err) {
      console.log(err)
    }
  },
  deleteRestaurant: async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    // delete restaurant
    await restaurant.destroy()
    return res.redirect('/admin/restaurants')
  },
  editUsers: async (req, res) => {
    try {
      // save user search input
      const searchInput = req.query.email || ''
      // get all users
      const users = await User.findAll({
        where: { email: { [Op.like]: `%${searchInput}%` } }
      })
      return res.render('admin/users', { users, searchInput })
    } catch (err) {
      console.log(err)
    }
  },
  putUsers: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id)
      user.isAdmin = !user.isAdmin
      await user.save()
      req.flash('success_messages', 'user role has been updated successfully')
      return res.redirect('/admin/users')
    } catch (err) {
      console.log(err)
    }
  }
}