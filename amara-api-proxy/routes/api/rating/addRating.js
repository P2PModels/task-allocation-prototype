const Router = require('express').Router
const db = require('../../../models')

module.exports = Router({ mergeParams: true })
    .post('/ratings', async (req , res, next) => {
        try {
          const { userId, date, score } = req.body
          const lastId = await db.daoRatings.createRating(userId, date, score)
          console.log(userId, date, score)
          return res.json({lastId: 5})
        } catch(error) {
            next(error)
        }
    })