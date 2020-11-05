const express = require('express')
// const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const logger = require('./winston')
const router = require('./routes/createRouter')()

const {
  accessControlAllowHandler,
  amaraKeyHandler,
  queryParamsHandler,
  errorHandler,
} = require('./middlewares')()

module.exports = () =>
  express()
    .use(accessControlAllowHandler)
    // .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(morgan('tiny', { stream: logger.stream }))
    .use(amaraKeyHandler)
    // .use(cors())
    .use(queryParamsHandler)
    .use('/api', router)
    .use(errorHandler)
