const db = require('../models')
const Comment = db.Comment
module.exports = {
  postComment: async (req, res) => {
    try {
      await Comment.create({
        text: req.body.text,
        RestaurantId: req.body.restaurantId,
        UserId: req.user.id
      })
      return res.redirect(`/restaurants/${req.body.restaurantId}`)
    } catch (err) {
      console.log(err)
    }
  },
  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      return res.redirect(`/restaurants/${comment.RestaurantId}`)
    } catch (err) {
      console.log(err)
    }
  }
}