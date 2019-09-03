const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

// JWT
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

module.exports = {
  signIn: async (req, res) => {
    // check if any field is empty
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: 'Email and password are required!' })
    }
    // save data to variables
    const username = req.body.email
    const password = req.body.password

    const user = await User.findOne({ where: { email: username } })
    // no user found
    if (!user) return res.status(401).json({ status: 'error', message: 'No such user' })
    // existing user: check password
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ status: 'error', message: 'Wrong password' })
    // sign token
    const payload = { id: user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return res.json({
      status: 'success',
      message: 'ok',
      token,
      user: {
        id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin
      }
    })
  }
}