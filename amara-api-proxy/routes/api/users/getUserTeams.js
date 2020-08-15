const Router = require('express').Router
const db = require('../../../models')

module.exports = Router({ mergeParams: true }).get(
  '/users/:username/teams',
  async (req, res, next) => {
    try {
      const teams = await db.daoUsers.readUserTeams(req.params.username)
      return res.json(teams)
    } catch (error) {
      next(error)
    }
  }
)
