const app = require('./createExpressApp')()
const { PORT } = require('./config')

function runServer(port) {
  app.listen(port, async err => {
    if (err) console.log(`Couldn't run server. ${err.message}`)
    else console.log(`App has started on port ${port}`)
  })
}

runServer(PORT)
