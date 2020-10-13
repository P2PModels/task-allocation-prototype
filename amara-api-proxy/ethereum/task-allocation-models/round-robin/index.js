const { exec } = require('child_process')

const { generateMockData } = require('./mock-data-helpers')
const roundRobin = require('../round-robin/round-robin')

exports.startRoundRobin = (mockData = false) => {
  exec(
    'node ./ethereum/task-allocation-models/round-robin/events-listener.js',
    (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }
      console.log('Run event listeners: ')
      console.log(stdout)
      if (mockData) generateMockData()
    }
  )
}

exports.roundRobin = roundRobin
