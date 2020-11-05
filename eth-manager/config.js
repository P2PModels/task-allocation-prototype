const dotenv = require('dotenv')
const yargs = require('yargs/yargs')
const { hideBin } = yargs

const argv = yargs(hideBin(process.argv)).argv

const result = dotenv.config()

let envs

if (!('error' in result)) {
  envs = result.parsed
} else {
  envs = {}
  Object.keys(process.env).forEach(key => {
    envs[key] = process.env[key]
  })
}

// Local configuration
envs.LOCAL_PROVIDER = 'ws://localhost:8545'
envs.LOCAL_ROUND_ROBIN_CONTRACT_ADDRESS='0xa1a7d254552beb05f15522eed93b54441e61d1d9'
envs.LOCAL_SERVER_ACCOUNT_ADDRESS='0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'

// Rinkeby configuration
envs.RINKEBY_ROUND_ROBIN_CONTRACT_ADDRESS='0xc4742689C106558ae02F61973066fdD26449d823'

envs.DEFAULT_GAS=8000000

// Set command parameters 
envs.argv = argv

module.exports = envs
