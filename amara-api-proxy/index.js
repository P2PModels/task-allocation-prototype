const ngrok = require('ngrok')

const app = require('./createExpressApp')()
const { PROXY_API_PORT } = require('./config')
// const {
//   startRoundRobin,
// } = require('./ethereum/task-allocation-models/round-robin')

const port = PROXY_API_PORT

app.listen(port, err => {
  if (err) console.log(`Couldn't run server. ${err.message}`)
  else {
    console.log(`Server listening on port ${port}`)

    ngrok.connect(port).then(
      url => {
        console.log(`Server is publicly-accesible at ${url}`)
        // startRoundRobin(true)
      },
      err => console.log('Error trying to initialize ngrok', err)
    )
  }
})
