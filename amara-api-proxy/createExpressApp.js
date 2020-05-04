const express = require('express')
const router = require('./routes/createRouter')()
const cors = require('cors')
const bodyParser = require('body-parser')


const { accessControlAllowHandler, amaraKeyHandler, queryParamsHandler, errorHandler } = require('./middlewares')()

module.exports = () => express()
    .use(accessControlAllowHandler)
    // .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(amaraKeyHandler)
    // .use(cors())
    .use(queryParamsHandler)
    .use('/api', router)
    .use(errorHandler)