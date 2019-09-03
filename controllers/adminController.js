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
  editUsers: (req, res) => {
    adminService.editUsers(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('admin/users', data)
    })
  },
  putUsers: (req, res) => {
    adminService.putUsers(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('/admin/users')
    })
  }
}