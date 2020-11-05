// const nodemon = require('nodemon')
// const ngrok = require('ngrok')
const { PORT } = require('./config')
const { runServer } = require('./app')

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
