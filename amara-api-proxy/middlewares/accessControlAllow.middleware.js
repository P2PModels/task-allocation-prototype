const { API_HEADERS } = require('../utils/amara-utils')

module.exports = function accessControlAllowHandler(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*') // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', API_HEADERS.join())
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
  next()
}
