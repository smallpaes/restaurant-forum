const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
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
          { model: Comment, include: [Restaurant] }
        ]
      })

      // get all commented restaurants
      const commentHistory = owner.Comments.map(comment => ({
        comment: comment.text,
        name: comment.Restaurant.name,
        image: comment.Restaurant.image,
        RestaurantId: comment.RestaurantId
      }))

      return res.render('profile', {
        owner,
        commentHistory,
        profileCSS: true,
        commentCount: commentHistory.length
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
  }
}