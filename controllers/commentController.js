const commentService = require('../services/commentService')
module.exports = {
  postComment: (req, res) => {
    commentService.postComment(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
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