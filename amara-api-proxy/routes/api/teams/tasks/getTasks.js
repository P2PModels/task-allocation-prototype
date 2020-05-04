const Router = require('express').Router
const axios = require('../../axios')


module.exports = Router({ mergeParams: true })
    .get('/teams/:slug/tasks', async (req ,res, next) => {
        try {
            const response = await axios.get(`/teams/${req.params.slug}/tasks/?open=true`)

            return res.json(response.data)
        } catch(error) {
            next(error)
        }
    })