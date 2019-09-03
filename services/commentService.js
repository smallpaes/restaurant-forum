const db = require('../models')
const Comment = db.Comment

module.exports = {
  postComment: async (req, res, callback) => {
    try {
      await Comment.create({
        text: req.body.text,
        RestaurantId: req.body.restaurantId,
        UserId: req.user.id
      })
      return callback({ status: 'success' })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  },
}