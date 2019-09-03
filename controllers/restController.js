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
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)

      return res.render('restaurant', data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('feeds', data)
    })
  },
  getDashboard: (req, res) => {
    restService.getDashboard(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      res.render('dashboard', data)
    })
  },
  getTopRestaurants: (req, res) => {
    restService.getTopRestaurants(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('topRestaurant', data)
    })
  }
}