const Router = require('express').Router
const db = require('../../../models')

module.exports = Router({ mergeParams: true }).get(
  '/users/:identifier',
  async (req, res, next) => {
    try {
      const user = await db.daoUsers.readUser(req.params.identifier)

      return res.json(user)
    } catch (error) {
      next(error)
    }
  }
)
