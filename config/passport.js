const passport = require('passport')
const LocalStorage = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
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
  User.findByPk(id)
    .then(user => cb(null, user))
})

module.exports = passport