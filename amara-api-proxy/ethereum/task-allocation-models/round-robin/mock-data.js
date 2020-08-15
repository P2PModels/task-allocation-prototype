const axios = require('../../../axios')
const { web3 } = require('../../web3')

const { AMARA_STAGING_API_KEY } = require('../../../config')
const { API_HEADER_KEY } = require('../../../utils/amara-utils')

const { getRRContract } = require('./round-robin')
const rrContract = getRRContract()

const AMARA_TEAM = 'collab-demo-team'
const USER_ACCOUNTS = [
  'p2pmodels.user1',
  'p2pmodels.user2',
  'p2pmodels.user3',
  'p2pmodels.user4',
  'p2pmodels.user5',
  'p2pmodels.user6',
]

async function getInitialTasks(team) {
  const {
    data: { objects: assignments },
  } = await axios.get(
    `/teams/${team}/subtitle-requests/?work_status=needs-subtitler`,
    { headers: { [API_HEADER_KEY]: AMARA_STAGING_API_KEY } }
  )
  const tasksIds = assignments.map(({ job_id: taskId }) => taskId)

  return tasksIds.slice(0, 5)
}

async function registerMockUserAccounts(userAccounts) {
  const batch = new web3.BatchRequest()
  userAccounts.forEach(acc => {
    const hexUser = web3.utils.toHex(acc)
    batch.add(
      rrContract.methods.registerUser(hexUser).send.request({}, err => {
        if (err) console.error(err)
      })
    )
  })
  batch.execute()
}

async function createMockTasks(tasks, userAccounts) {
  const batch = new web3.BatchRequest()
  tasks.forEach(id => {
    const randomUser =
      userAccounts[Math.floor(Math.random() * userAccounts.length)]
    const hexId = web3.utils.toHex(id)
    const hexUser = web3.utils.toHex(randomUser)
    batch.add(
      rrContract.methods.createTask(hexUser, hexId).send.request({}, err => {
        if (err) console.error(err)
      })
    )
  })
  batch.execute()
}

exports.generateMockData = async () => {
  try {
    // Register amara users
    registerMockUserAccounts(USER_ACCOUNTS)
    const tasks = await getInitialTasks(AMARA_TEAM)
    // Created tasks
    createMockTasks(tasks, USER_ACCOUNTS)
  } catch (err) {
    console.error(`There has been an error trying to mock data ${err}`)
  }
}
