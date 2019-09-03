const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Category = db.Category
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const sharp = require('sharp')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID


module.exports = {
  addFavorite: async (req, res, callback) => {
    try {
      await Favorite.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
  removeFavorite: async (req, res, callback) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      // remove favorite
      await favorite.destroy()
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
  addLike: async (req, res, callback) => {
    try {
      await Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
  deleteLike: async (req, res, callback) => {
    try {
      const like = await Like.findOne({
        where: {
          UserId: req.user.id,
          RestaurantId: req.params.restaurantId
        }
      })
      // delete the like
      await like.destroy()
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
}