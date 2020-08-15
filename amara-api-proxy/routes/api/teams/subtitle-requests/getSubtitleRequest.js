const Router = require('express').Router
const axios = require('../../../../axios')

module.exports = Router({ mergeParams: true }).get(
  '/teams/:slug/subtitle-requests/:jobId',
  async (req, res, next) => {
    try {
      const response = await axios.get(
        `/teams/${req.params.slug}/subtitle-requests/${req.params.jobId}/`
      )
      return res.json(response.data)
    } catch (error) {
      next(error)
    }
  }
)
