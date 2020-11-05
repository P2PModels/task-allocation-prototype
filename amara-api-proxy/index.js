// const { exec } = require('child_process')
const nodemon = require('nodemon')
const ngrok = require('ngrok')

const { web3 } = require('./ethereum/web3')
const {
  setUpEventListeners,
} = require('./ethereum/task-allocation-models/round-robin/event-listener-helpers')
const { PORT } = require('./config')

const app = require('./createExpressApp')()

function runServer(port) {
  app.listen(port, async err => {
    if (err) console.log(`Couldn't run server. ${err.message}`)
    else console.log(`App has started on port ${port}`)
  })
}

runServer(PORT)

// ngrok.connect(PROXY_API_PORT).then(
//   async url => {
//     // We inject the url as NGROK_URL env var into our node process,
//     // and have nodemon start our main web server process
//     console.log('Ngrok tunnel opened at ' + url)
//     nodemon(`--ignore testingContract.js -x 'NGROK_URL=${url} node' app.js`)
//       .on('start', function () {})
//       .on('quit', function () {
//         console.log('App has quit')

//         // Disconnect and kill ngrok process on port 4049
//         ngrok.disconnect(url)
//         ngrok.kill()

//         process.exit()
//       })
//       .on('restart', function (files) {
//         console.log('App restarted due to: ', files)
//       })
//   },
//   err => {
//     if (err) {
//       console.error('Error opening ngrok tunnel', err)
//       process.exit(1)
//     }
//   }
// )

// const killProcessOnPortCommand = port => {
//   return `kill -9 $(lsof -n -i :${port} | grep LISTEN | awk '{print $2}')`
// }
