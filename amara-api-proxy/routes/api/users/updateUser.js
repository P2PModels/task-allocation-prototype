const Router = require('express').Router
const db = require('../../../models')

module.exports = Router({ mergeParams: true }).post(
  '/users/:id',
  (req, res, next) => {
    try {
      db.daoUsers.updateUser(req.params.id, req.body.active)
      return res.json({ rowsChanged: 1 })
    } catch (error) {
      next(error)
    }
  }
)
