const {
  LOCAL_SERVER_ACCOUNT_ADDRESS,
  ROUND_ROBIN_CONTRACT_ADDRESS,
  DEFAULT_GAS,
} = require('../../../config')
const { web3 } = require('../../web3')
const roundRobinAppAbi = require('../../../abis/RoundRobinApp.json')

exports.getRRContract = address => {
  return new web3.eth.Contract(
    roundRobinAppAbi,
    address || ROUND_ROBIN_CONTRACT_ADDRESS,
    {
      from: LOCAL_SERVER_ACCOUNT_ADDRESS,
      gas: DEFAULT_GAS,
    }
  )
}
