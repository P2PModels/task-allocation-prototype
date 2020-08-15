const Web3 = require('web3')
const { LOCAL_PROVIDER } = require('../config')

exports.web3 = new Web3(new Web3.providers.WebsocketProvider(LOCAL_PROVIDER))
