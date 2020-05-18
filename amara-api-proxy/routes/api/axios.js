const axios = require('axios')

const instance = axios.create({
  // baseURL: 'https://amara.org/api/',
  baseURL: 'https://staging.amara.org/api/'
})

module.exports = instance