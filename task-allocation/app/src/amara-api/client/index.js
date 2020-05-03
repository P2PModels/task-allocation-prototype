import axios from 'axios'

const PORT = 5000
const HOST =
  process.env.NODE_ENV !== 'production' ? 'localhost' : '192.168.1.123'
// const baseURL = `http://${HOST}:${PORT}/api`
const baseURL = ``
const headers = { 'X-api-key': '' }
const ROOT = '/api'
const instance = axios.create({
  baseURL: baseURL ? `${baseURL}${ROOT}` : ``,
  headers,
})

function setApiKeyHeader(apiKey) {
  instance.defaults.headers['X-api-key'] = apiKey  
}

function setBaseUrl(url) {
  instance.defaults.baseURL = url + ROOT
}
export { instance, setApiKeyHeader, setBaseUrl }
