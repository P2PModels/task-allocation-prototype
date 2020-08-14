const axios = require('axios')
const { AMARA_STAGING_API } = require('./config')

const instance = axios.create({
  baseURL: AMARA_STAGING_API,
})

module.exports = instance
