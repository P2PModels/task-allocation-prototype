const Web3 = require('web3')
const {
  LOCAL_PROVIDER,
  RINKEBY_PROVIDER,
  RINKEBY_SERVER_ACCOUNT_PRIVATE_KEY,
  LOCAL_SERVER_ACCOUNT_ADDRESS,
  argv
} = require('../config')

const network = argv.network || 'local'

function setUpWeb3(network = 'local') {
  let web3
  if (network === 'rinkeby') {
    web3 = new Web3(new Web3.providers.WebsocketProvider(RINKEBY_PROVIDER))
    const addedAccount = web3.eth.accounts.wallet.add(RINKEBY_SERVER_ACCOUNT_PRIVATE_KEY)
    web3.eth.defaultAccount = addedAccount.address
  }
  else if (network === 'local') {
    web3 = new Web3(new Web3.providers.WebsocketProvider(LOCAL_PROVIDER))
    web3.eth.defaultAccount = LOCAL_SERVER_ACCOUNT_ADDRESS
  }

  return web3
}

const web3 = setUpWeb3(network)

exports.web3 = web3
