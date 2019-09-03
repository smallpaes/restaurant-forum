const commentService = require('../services/commentService')
module.exports = {
  postComment: (req, res) => {
    commentService.postComment(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
  },
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, data => {
      // handle error
      if (data.status === 'error') return console.log(data.message)
      return res.redirect(`/restaurants/${data.RestaurantId}`)
    })
  }
}