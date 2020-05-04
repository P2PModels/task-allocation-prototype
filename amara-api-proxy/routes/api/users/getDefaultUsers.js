const Router = require('express').Router
const db = require('../../../models')

module.exports = Router({ mergeParams: true })
    .get('/users/default', async (req , res, next) => {
        try {
            const users = await db.daoUsers.readAvailableUsers()
            return res.json(users)
        } catch(error) {
            next(error)
        }
    })