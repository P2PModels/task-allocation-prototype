const DAO = require('./DAO')
const UserRepository = require('./UserRepository')

const DBPath = `${__dirname}/schemes/amara-users`

const dao = new DAO(DBPath)

module.exports = {
  daoUsers: new UserRepository(dao),
}