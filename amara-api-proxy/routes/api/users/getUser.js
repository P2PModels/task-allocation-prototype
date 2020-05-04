const Router = require('express').Router
const axios = require('../axios')

module.exports = Router({ mergeParams: true })
    .get('/users/:identifier/', async (req, res, next) => {
        try {
            const response = await axios.get(`/users/${req.params.identifier}`)
            return res.json(response.data)
        } catch (error) {
            next(error)
        }
    })