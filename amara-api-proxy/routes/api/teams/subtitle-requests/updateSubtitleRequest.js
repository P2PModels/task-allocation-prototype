const Router = require('express').Router
const axios = require('../../axios')

module.exports = Router({ mergeParams: true })
    .put('/teams/:slug/subtitle-requests/:jobId', async (req, res, next) => {
        try {
            /*We're using the owner team's API key because Amara API returns a 403 (no permission) 
              when we call it with user's own API key
            */
            const response = await axios.put(`/teams/${req.params.slug}/subtitle-requests/${req.params.jobId}/`,
              { subtitler: req.body.subtitler },
              { headers: {'X-api-key': '525a2b625baf11a48566f4b32876d0bfad9375ba'}}
            )
            return res.json(response.data)
        } catch (error) {
            next(error)
        }
    })