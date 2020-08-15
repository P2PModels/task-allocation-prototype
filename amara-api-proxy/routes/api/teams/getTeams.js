const Router = require('express').Router
const axios = require('../../../axios')
// const axios = require('axios')

module.exports = Router({ mergeParams: true })
    .get('/teams/:slug', async (req ,res, next) => {
        try {
            const response = await axios.get(`/teams/${req.params.slug}/`)
            return res.json(response.data)
        } catch(error) {
            next(error)
        }
    })