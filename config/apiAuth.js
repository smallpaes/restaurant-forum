const passport = require('./passport')

module.exports = {
  isAuthUser: passport.authenticate('jwt', { session: false }),
  isAuthAdmin: (req, res, next) => {
    if (!req.user) return res.json({ status: 'error', message: 'permission denied' })
    if (!req.user.isAdmin) return res.json({ status: 'error', message: 'permission denied' })
    next()
  },
  isOwner: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) {
      return res.json({ status: 'error', message: 'Not the owner' })
    }
    next()
  }
}