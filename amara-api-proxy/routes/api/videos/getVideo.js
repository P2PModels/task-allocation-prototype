const Router = require('express').Router
const axios = require('../axios')


module.exports = Router({ mergeParams: true })
    .get('/videos/:id', async (req ,res, next) => {
        try {
            const response = await axios.get(`/videos/${req.params.id}/${req.queryParams}`)
            return res.json(response.data)
        } catch(error) {
            next(error)
        }
    })