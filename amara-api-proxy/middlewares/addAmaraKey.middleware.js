const axios = require('../axios')
const { API_HEADER_KEY } = require('../utils/amara-utils')

module.exports = function amaraKeyHandler(req, res, next) {
  
  const apiKey = req.header(API_HEADER_KEY)
  if(apiKey) 
    axios.defaults.headers.common['X-api-key'] = apiKey
  return next()
}