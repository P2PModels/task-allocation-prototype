const {
  LOCAL_ROUND_ROBIN_CONTRACT_ADDRESS,
  RINKEBY_ROUND_ROBIN_CONTRACT_ADDRESS,
  RINKEBY_SERVER_ACCOUNT_PRIVATE_KEY,
  DEFAULT_GAS,
  argv
} = require('../../../config')
const { web3 } = require('../../web3')
const roundRobinAppAbi = require('../../../abis/RoundRobinApp.json')

function getRRContract() {
  const network = argv.network || 'local'
  let contractAddress
  let options = { gas: DEFAULT_GAS }

  if (network === 'rinkeby'){
    contractAddress = RINKEBY_ROUND_ROBIN_CONTRACT_ADDRESS
  }
  else {
    contractAddress = LOCAL_ROUND_ROBIN_CONTRACT_ADDRESS
  }

  return new web3.eth.Contract(
    roundRobinAppAbi,
    contractAddress,
    options
  )
}
const contract = getRRContract()

exports.rrContract = contract

exports.callContractMethod = async (methodName, args) => {
  const method = contract.methods[methodName](...args)
  const tx = {
    from: web3.eth.defaultAccount,
    to: contract.options.address,
    data: method.encodeABI(),
    gas: DEFAULT_GAS
  }

  const { rawTransaction } = await web3.eth.accounts.signTransaction(tx, RINKEBY_SERVER_ACCOUNT_PRIVATE_KEY)
  const response = await web3.eth.sendSignedTransaction(rawTransaction)

  return response
}
