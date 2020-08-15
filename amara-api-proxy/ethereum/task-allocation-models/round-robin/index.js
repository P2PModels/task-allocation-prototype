const { setUpEventListeners } = require('./events-listener')
const { generateMockData } = require('./mock-data')

exports.startRoundRobin = (mockData = false) => {
  setUpEventListeners()
  if (mockData) generateMockData()
}
