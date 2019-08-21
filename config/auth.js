module.exports = {
  isAuthUser: (req, res, next) => {
    if (!req.isAuthenticated()) { return res.redirect('/signin') }
    next()
  },
  isAuthAdmin: (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) { return res.redirect('/signin') }
    next()
  }
}