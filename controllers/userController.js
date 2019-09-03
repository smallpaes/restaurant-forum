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
const userService = require('../services/userService')

module.exports = {
  signUpPage: (req, res) => {
    return res.render('signup', { authFormCSS: true })
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
    return res.render('signin', { authFormCSS: true })
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

      return res.render('profile', { owner, uniqueComment, profileCSS: true })
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
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
  },
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
  },
  addLike: (req, res) => {
    userService.addLike(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
  },
  deleteLike: async (req, res) => {
    userService.deleteLike(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
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
        isFollowed: req.user.Followings.filter(d => d.id === user.id).length !== 0,
        // 辨認是否為自己
        isOwner: user.id === req.user.id
      }))
      console.log(users)
      // 依追蹤者人數排序
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users, displayPanelCSS: true })
    } catch (err) {
      console.log(err)
    }
  },
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
  },
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect('back')
    })
  }
}