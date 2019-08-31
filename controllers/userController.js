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
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  signUp: async (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同!')
      return res.redirect('/signup')
    }

    try {
      // check unique user
      const user = await User.findOne({ where: { email: req.body.email } })
      // existing user
      if (user) {
        req.flash('error_messages', '信箱重複!')
        return res.redirect('/signup')
      }
      // create new user
      await User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        image: 'https://randomuser.me/api/portraits/lego/1.jpg'
      })
      req.flash('success_messages', '成功註冊帳號!')
      return res.redirect('/signin')
    } catch (err) {
      console.log(err)
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },
  signIn: (req, res) => {
    console.log('req')
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', "登出成功")
    req.logout()
    res.redirect('/signin')
  },
  getUser: async (req, res) => {
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
      const uniqueComment = []
      const commentHistory = owner.Comments.map(comment => {
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

      // get all restaurants saved to favorite
      const favoriteList = owner.FavoritedRestaurants.map(restaurant => ({
        name: restaurant.name,
        image: restaurant.image,
        RestaurantId: restaurant.id,
        category: restaurant.Category.name
      }))

      // get all following users
      const followingList = owner.Followings.map(user => ({
        name: user.name,
        image: user.image,
        UserId: user.id
      }))

      // get all followers
      const followerList = owner.Followers.map(user => ({
        name: user.name,
        image: user.image,
        UserId: user.id
      }))

      // check if has already followed this user or it is the user himself/herself
      const isFollowed = req.user.Followings.filter(user => user.id === Number(req.params.id)).length !== 0 || Number(req.params.id) === req.user.id
      console.log(isFollowed)
      return res.render('profile', {
        owner,
        commentHistory,
        profileCSS: true,
        commentCount: uniqueComment.length,
        favoriteList,
        favoriteCount: favoriteList.length,
        followingList,
        followingCount: followingList.length,
        followerList,
        followerCount: followerList.length,
        isFollowed
      })
    } catch (err) {
      console.log(err)
    }
  },
  editUser: (req, res) => {
    return res.render('editProfile', { profileCSS: true })
  },
  putUser: async (req, res) => {
    // check if name or email is empty
    if (!req.body.name || !req.body.email) {
      req.flash('error_messages', 'Name and email are required')
      return res.redirect('back')
    }

    // save without a new image
    if (!req.file) {
      try {
        const user = await User.findByPk(req.params.id)
        await user.update({
          name: req.body.name,
          email: req.body.email
        })
        req.flash('success_messages', 'Profile has been updated')
        return res.redirect(`/users/${user.id}`)
      } catch (err) {
        return console.log(err)
      }
    }

    try {
      // resize the file
      await sharp(req.file.path).resize({ width: 200, height: 200 }).png().toFile(`${req.file.path}-edited.png`)
      // save with a new image
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(`${req.file.path}-edited.png`, async (err, img) => {
        try {
          const user = await User.findByPk(req.params.id)
          await user.update({
            name: req.body.name,
            email: req.body.email,
            image: req.file ? img.data.link : user.image
          })
          req.flash('success_messages', 'Profile has been updated')
          return res.redirect(`/users/${user.id}`)
        } catch (err) {
          console.log(err)
        }
      })
    } catch (err) {
      console.log(err)
    }
  },
  addFavorite: async (req, res) => {
    try {
      await Favorite.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }
  },
  removeFavorite: async (req, res) => {
    try {
      const favorite = await Favorite.findOne({
        where: {
          RestaurantId: req.params.restaurantId,
          UserId: req.user.id
        }
      })
      // remove favorite
      await favorite.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }
  },
  addLike: async (req, res) => {
    try {
      await Like.create({
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      })
      return res.redirect('back')
    } catch (err) {
      console.log(ERR)
    }
  },
  deleteLike: async (req, res) => {
    try {
      const like = await Like.findOne({
        where: {
          UserId: req.user.id,
          RestaurantId: req.params.restaurantId
        }
      })
      // delete the like
      await like.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }
  },
  getTopUser: async (req, res) => {
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
        isFollowed: req.user.Followings.filter(d => d.id === user.id).length !== 0
      }))
      console.log(users)
      // 依追蹤者人數排序
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users, displayPanelCSS: true })
    } catch (err) {
      console.log(err)
    }
  },
  addFollowing: async (req, res) => {
    try {
      await Followship.create({
        followerId: req.user.id,
        followingId: req.params.userId
      })
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }
  },
  removeFollowing: async (req, res) => {
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
      return res.redirect('back')
    } catch (err) {
      console.log(err)
    }
  }
}