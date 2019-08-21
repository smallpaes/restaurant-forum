const fs = require('fs')
const db = require('../models')
const Restaurant = db.Restaurant
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

module.exports = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll()
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: async (req, res) => {
    // check if name is provided
    if (!req.body.name) {
      req.flash('error_messages', 'Name is required')
      res.redirect('back')
    }
    // create restaurant
    try {
      if (req.file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(req.file.path, async (err, img) => {
          await Restaurant.create({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: req.file ? img.data.link : null
          })
          req.flash('success_messages', 'restaurant is created successfully')
          return res.redirect('/admin/restaurants')
        })
      } else {
        await Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: null
        })
        req.flash('success_messages', 'restaurant is created successfully')
        res.redirect('/admin/restaurants')
      }

    } catch (err) {
      console.log(err)
    }

  },
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      return res.render('admin/restaurant', { restaurant })
    } catch (err) {
      console.log(err)
    }
  },
  editRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id)
      return res.render('admin/create', { restaurant })
    } catch (err) {
      console.log(err)
    }
  },
  putRestaurant: async (req, res) => {
    // check if name is provided
    if (!req.body.name) {
      req.flash('error_messages', 'name is required')
      res.redirect('back')
    }
    try {
      if (req.file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        imgur.upload(req.file.path, async (err, img) => {
          // update restaurant info
          const restaurant = await Restaurant.findByPk(req.params.id)
          await restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: req.file ? img.data.link : restaurant.image
          })
          // send flash message
          req.flash('success_messages', 'restaurant is updated successfully')
          res.redirect('/admin/restaurants')
        })
      } else {
        // update restaurant info
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: restaurant.image
        })
        // send flash message
        req.flash('success_messages', 'restaurant is updated successfully')
        return res.redirect('/admin/restaurants')
      }
    } catch (err) {
      console.log(err)
    }
  },
  deleteRestaurant: async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.id)
    // delete restaurant
    await restaurant.destroy()
    return res.redirect('/admin/restaurants')
  }
}