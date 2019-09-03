const express = require('express')
const router = express.Router()
const { isAuthUser, isAuthAdmin } = require('../config/apiAuth')

// Include multer and config
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController')
const restController = require('../controllers/api/restController')

router.get('/restaurants', isAuthUser, restController.getRestaurants)
router.get('/restaurants/feeds', isAuthUser, restController.getFeeds)

router.get('/admin/restaurants', isAuthUser, isAuthAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/:id', isAuthUser, isAuthAdmin, adminController.getRestaurant)
router.delete('/admin/restaurants/:id', isAuthUser, isAuthAdmin, adminController.deleteRestaurant)
router.post('/admin/restaurants', isAuthUser, isAuthAdmin, upload.single('image'), adminController.postRestaurant)
router.put('/admin/restaurants/:id', isAuthUser, isAuthAdmin, upload.single('image'), adminController.putRestaurant)

router.get('/admin/categories', isAuthUser, isAuthAdmin, categoryController.getCategories)
router.post('/admin/categories', isAuthUser, isAuthAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', isAuthUser, isAuthAdmin, categoryController.deleteCategory)

router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

module.exports = router