const passport = require('passport')
const LocalStorage = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const Restaurant = db.Restaurant
const Like = db.Like
const User = db.User


passport.use(new LocalStorage({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } })
      .then(user => {
        // no such user
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
        // wrong password
        if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤!'))
        return cb(null, user)
      })
  }
))


// serialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

// deserialize user
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [
      { model: db.Restaurant, as: 'FavoritedRestaurants' },
      { model: db.Restaurant, as: 'LikedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
    .then(user => cb(null, user))
})

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
// config options
const jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT_SECRET
// config strategy
const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
  try {
    const user = await User.findByPk(jwt_payload.id, {
      include: [
        { model: db.Restaurant, as: 'FavoritedRestaurants' },
        { model: db.Restaurant, as: 'LikedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
    // no such user
    if (!user) return next(null, false)
    // pass user found
    return next(null, user)
  } catch (err) {
    return next(err, false)
  }
})

passport.use(strategy)

module.exports = passport