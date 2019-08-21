const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const { isAuthUser, isAuthAdmin } = require('../config/auth')
// Include multer and config
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  app.get('/', isAuthUser, (req, res) => res.redirect('restaurants'))
  app.get('/restaurants', isAuthUser, restController.getRestaurants)

  app.get('/admin', isAuthAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', isAuthAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', isAuthAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', isAuthAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', isAuthAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', isAuthAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', isAuthAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', isAuthAdmin, adminController.deleteRestaurant)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)
}