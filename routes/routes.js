const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const categoryController = require('../controllers/categoryController')
const commentController = require('../controllers/commentController')
const { isAuthUser, isAuthAdmin, isOwner } = require('../config/auth')
// Include multer and config
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

router.get('/', isAuthUser, (req, res) => res.redirect('restaurants'))
router.get('/restaurants', isAuthUser, restController.getRestaurants)
router.get('/restaurants/feeds', isAuthUser, restController.getFeeds)
router.get('/restaurants/top', isAuthUser, restController.getTopRestaurants)
router.get('/restaurants/:id/dashboard', isAuthUser, restController.getDashboard)
router.get('/restaurants/:id', isAuthUser, restController.getRestaurant)

router.post('/favorite/:restaurantId', isAuthUser, userController.addFavorite)
router.delete('/favorite/:restaurantId', isAuthUser, userController.removeFavorite)

router.post('/like/:restaurantId', isAuthUser, userController.addLike)
router.delete('/like/:restaurantId', isAuthUser, userController.deleteLike)

router.post('/following/:userId', isAuthUser, userController.addFollowing)
router.delete('/following/:userId', isAuthUser, userController.removeFollowing)

router.post('/comments', isAuthUser, commentController.postComment)
router.delete('/comments/:id', isAuthAdmin, commentController.deleteComment)

router.get('/users/top', isAuthUser, userController.getTopUser)
router.get('/users/:id', isAuthUser, userController.getUser)
router.get('/users/:id/edit', isAuthUser, isOwner, userController.editUser)
router.put('/users/:id', isAuthUser, isOwner, upload.single('image'), userController.putUser)

router.get('/admin', isAuthAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', isAuthAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', isAuthAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', isAuthAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', isAuthAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', isAuthAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', isAuthAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', isAuthAdmin, adminController.deleteRestaurant)
router.get('/admin/users', isAuthAdmin, adminController.editUsers)
router.put('/admin/users/:id', isAuthAdmin, adminController.putUsers)
router.get('/admin/categories', isAuthAdmin, categoryController.getCategories)
router.post('/admin/categories', isAuthAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', isAuthAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', isAuthAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', isAuthAdmin, categoryController.deleteCategory)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
router.get('/logout', userController.logout)

module.exports = router