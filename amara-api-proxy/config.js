const dotenv = require('dotenv')

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

module.exports = envs
