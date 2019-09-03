const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const Favorite = db.Favorite
const User = db.User
const restService = require('../../services/restService')

module.exports = {
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, data => {
      return res.json(data)
    })
  },
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, data => {
      return res.json(data)
    })
  },
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, data => {
      return res.json(data)
    })
  },
}