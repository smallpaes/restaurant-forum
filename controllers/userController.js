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
  getUser: (req, res) => {
    userService.getUser(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('profile', data)
    })
  },
  editUser: (req, res) => {
    return res.render('editProfile', { profileCSS: true })
  },
  putUser: (req, res) => {
    userService.putUser(req, res, data => {
      // handle error
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return console.log(data.message)
      }

      req.flash('success_messages', data.message)
      return res.redirect(`/users/${data.userId}`)
    })
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
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.render('topUser', data)
    })
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