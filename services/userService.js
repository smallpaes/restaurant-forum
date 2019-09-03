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
  getUser: async (req, res, callback) => {
    const uniqueComment = []

    try {
      const owner = await User.findByPk(req.params.id, {
        include: [
          { model: Comment, include: [Restaurant] },
          { model: Restaurant, as: 'FavoritedRestaurants', include: [Category] },
          { model: User, as: 'Followings' },
          { model: User, as: 'Followers' }
        ]
      })

      // get all commented restaurants
      owner.commentHistory = owner.Comments.map(comment => {
        // duplicate comment
        if (uniqueComment.indexOf(comment.Restaurant.id) >= 0) { return { isNotDuplicate: false } }
        // unique comment
        uniqueComment.push(comment.Restaurant.id)
        return {
          comment: comment.text,
          name: comment.Restaurant.name,
          image: comment.Restaurant.image,
          RestaurantId: comment.RestaurantId,
          isNotDuplicate: true
        }
      })

      // check if has already followed this user or it is the user himself/herself
      owner.isFollowed = req.user.Followings.filter(user => user.id === Number(req.params.id)).length !== 0 || Number(req.params.id) === req.user.id

      return callback({ status: 'success', owner, uniqueComment, profileCSS: true })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
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
  getTopUser: async (req, res, callback) => {
    try {
      let users = await User.findAll({
        include: [
          { model: User, as: 'Followers' }
        ]
      })

      users = users.map(user => ({
        ...user.dataValues,
        // 追蹤人數
        FollowerCount: user.Followers.length,
        // 辨認是否已追蹤
        isFollowed: req.user.Followings.filter(d => d.id === user.id).length !== 0,
        // 辨認是否為自己
        isOwner: user.id === req.user.id
      }))

      // 依追蹤者人數排序
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return callback({ status: 'success', users, displayPanelCSS: true })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
  addFollowing: async (req, res, callback) => {
    try {
      await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      })
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  },
  removeFollowing: async (req, res, callback) => {
    try {
      // find the followship
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
      // destroy followship
      await followship.destroy()
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error' })
    }
  }
}