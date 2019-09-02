const fs = require('fs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const adminService = require('../services/adminService')
const { getOrder, getPagination, getPaginationInfo } = require('../tools')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const ITEMS_PER_PAGE = 10

module.exports = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },
  createRestaurant: async (req, res) => {
    try {
      const categories = await Category.findAll()
      return res.render('admin/create', { page: 1, categories })
    } catch (err) {
      console.log(err)
    }
  },
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, ({ status, message }) => {
      if (status === 'error') {
        req.flash('error_messages', message)
        return res.redirect('back')
      }
      req.flash('success_messages', message)
      return res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, data => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: async (req, res) => {
    try {
      const page = req.query.page
      const restaurant = await Restaurant.findByPk(req.params.id)
      const categories = await Category.findAll()
      return res.render('admin/create', { restaurant, page, categories })
    } catch (err) {
      console.log(err)
    }
  },
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, ({ status, message }) => {
      if (status === 'error') {
        req.flash('error_messages', message)
        return res.redirect('back')
      }

      req.flash('success_messages', message)
      res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, ({ status }) => {
      if (status === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  editUsers: async (req, res) => {
    try {
      // get order criteria
      const order = getOrder(req.query.sortBy)

      // handle pagination
      const { page, limiting } = getPaginationInfo(ITEMS_PER_PAGE, req.query.page)

      // save user search input
      const searchInput = req.query.email || ''
      // get all users
      const users = await User.findAndCountAll({
        where: Sequelize.where(Sequelize.fn('lower', Sequelize.col('email')), 'LIKE', `%${searchInput.toLowerCase()}%`),
        order,
        ...limiting
      })

      // generate an array based on the number of total pages
      const pagination = getPagination(users.count, ITEMS_PER_PAGE)

      return res.render('admin/users', {
        users: users.rows,
        searchInput,
        pagination,
        currentPage: page,
        nextPage: page + 1,
        lastPage: page - 1,
        hasLastPage: page !== 1,
        hasNextPage: Math.ceil(users.count / ITEMS_PER_PAGE) !== page,
        sortBy: !order.length ? false : { [order[0][0]]: order[0][1] },
        sortEmail: !order.length ? false : order[0][0] === 'email' ? order[0][1] : false,
        sortId: !order.length ? false : order[0][0] === 'id' ? order[0][1] : false,
        sortRole: !order.length ? false : order[0][0] === 'isAdmin' ? order[0][1] : false
      })
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