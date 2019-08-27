module.exports = {
  isAuthUser: (req, res, next) => {
    if (!req.isAuthenticated()) { return res.redirect('/signin') }
    next()
  },
  isAuthAdmin: (req, res, next) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) { return res.redirect('/signin') }
    next()
  },
  isOwner: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) {
      req.flash('error_messages', 'Seems like you are not the owner, kindly login to the right account')
      return res.redirect('/signin')
    }
    next()
  }
}