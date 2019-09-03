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
  deleteComment: async (req, res, callback) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      return callback({ status: 'success', RestaurantId: comment.RestaurantId })
    } catch (err) {
      callback({ status: 'error', message: err })
    }
  }
}