const { web3 } = require('../../web3')
// const axios = require('../../../axios')

// const { AMARA_STAGING_API_KEY } = require('../../../config')
// const { API_HEADER_KEY } = require('../../../utils/amara-utils')

const { users, tasks } = require('./mock-data')

const { getRRContract } = require('./round-robin')
const rrContract = getRRContract()

async function getInitialTasksIds(tasks, maxTasks = 1) {
  // const {
  //   data: { objects: assignments },
  // } = await axios.get(
  //   `/teams/${team}/subtitle-requests/?work_status=needs-subtitler`,
  //   { headers: { [API_HEADER_KEY]: AMARA_STAGING_API_KEY } }
  // )
  const tasksIds = tasks.map(({ job_id: taskId }) => taskId)
  return tasksIds.slice(0, maxTasks)
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

async function createMockTasks(tasks) {
  const batch = new web3.BatchRequest()
  tasks.forEach(id => {
    const hexId = web3.utils.toHex(id)
    batch.add(
      rrContract.methods.createTask(hexId).send.request({}, err => {
        if (err) console.error(err)
      })
    )
  })
  batch.execute()
}

async function allocateMockTasks(tasks, userAccounts) {
  const batch = new web3.BatchRequest()
  const userTaskRegistry = userAccounts.reduce((reg, currUser) => {
    reg[currUser] = 0
    return reg
  }, {})
  const maxAllocatedTasks = await rrContract.methods
    .MAX_ALLOCATED_TASKS()
    .call()
  tasks.forEach(id => {
    let randomUser = getRandomUser(userAccounts)
    while (userTaskRegistry[randomUser] >= maxAllocatedTasks) {
      randomUser = getRandomUser(userAccounts)
    }
    userTaskRegistry[randomUser]++
    const hexId = web3.utils.toHex(id)
    const hexUser = web3.utils.toHex(randomUser)

    batch.add(
      rrContract.methods.allocateTask(hexId, hexUser).send.request({}, err => {
        if (err) console.error(err)
      })
    )
  })
  batch.execute()
}

function getRandomUser(users) {
  return users[Math.floor(Math.random() * users.length)]
}

exports.generateMockData = async () => {
  try {
    // Register amara users
    registerMockUserAccounts(users)
    const tasksIds = await getInitialTasksIds(tasks)
    // Create and allocate tasks
    createMockTasks(tasksIds)
    allocateMockTasks(tasksIds, users)
  } catch (err) {
    console.error(
      `There has been an error trying to generate mock data: ${err}`
    )
  }
}
