const app = require('./createExpressApp')()
const logger = require('./winston')
exports.runServer = port => {
  app.listen(port, async err => {
    if (err) logger.error(`Couldn't run server. ${err.message}`)
    else logger.info(`App has started on port ${port}`)
  })
}
