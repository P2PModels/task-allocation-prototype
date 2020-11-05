const { web3 } = require('../../web3')

const { users, tasks, reallocationTimes } = require('./mock-data')

const { rrContract, callContractMethod } = require('./round-robin')

async function getInitialTasksIds(tasks, maxTasks = 1) {
  const tasksIds = tasks.map(({ job_id: taskId }) => taskId)
  return tasksIds.slice(0, maxTasks)
}

async function registerMockUserAccounts(userAccounts) {
  // const batch = new web3.BatchRequest()
  
  for (let i = 0; i < userAccounts.length; i++) {
    const hexUser = web3.utils.toHex(userAccounts[i])
    const { transactionHash } = await callContractMethod('registerUser', [hexUser])
    console.log(`User ${userAccounts[i]} created. Tx hash: ${transactionHash}`)
  }
  // userAccounts.forEach(acc => {
  //   const hexUser = web3.utils.toHex(acc)
  //   batch.add(
  //     rrContract.methods.registerUser(hexUser).send.request({ from: web3.eth.defaultAccount }, err => {
  //       if (err) console.error(err)
  //     })
  //   )
  // })
  // batch.execute()
}

async function createMockTasks(tasks) {
  // const batch = new web3.BatchRequest()
  // tasks.forEach((id, index) => {
  //   const hexId = web3.utils.toHex(id)
  //   const reallocationTime = reallocationTimes[index]
  //   // const reallocationTime = getRandomElement(reallocationTimes)
  //   batch.add(
  //     rrContract.methods
  //       .createTask(hexId, reallocationTime)
  //       .send.request({}, err => {
  //         if (err) console.error(err)
  //       })
  //   )
  // })
  // batch.execute()

  for (let i = 0; i < tasks.length; i++) {
    const hexId = web3.utils.toHex(tasks[i])
    const reallocationTime = reallocationTimes[i]
    const { transactionHash } = await callContractMethod('createTask', [hexId, reallocationTime])
    console.log(`Task ${tasks[i]} created. Tx hash: ${transactionHash}`)
  }
}

async function allocateMockTasks(tasks, userAccounts) {
  // const batch = new web3.BatchRequest()
  const userTaskRegistry = userAccounts.reduce((reg, currUser) => {
    reg[currUser] = 0
    return reg
  }, {})
  const maxAllocatedTasks = await rrContract.methods
    .MAX_ALLOCATED_TASKS()
    .call()
  // tasks.forEach(id => {
  //   let randomUser = getRandomElement(userAccounts)
  //   while (userTaskRegistry[randomUser] >= maxAllocatedTasks) {
  //     randomUser = getRandomElement(userAccounts)
  //   }
  //   userTaskRegistry[randomUser]++
  //   const hexId = web3.utils.toHex(id)
  //   const hexUser = web3.utils.toHex(randomUser)

  //   batch.add(
  //     rrContract.methods.allocateTask(hexId, hexUser).send.request({}, err => {
  //       if (err) console.error(err)
  //     })
  //   )
  // })
  // batch.execute()

  for (let i = 0; i < tasks.length; i++) {
    let randomUser = getRandomElement(userAccounts)
    while (userTaskRegistry[randomUser] >= maxAllocatedTasks) {
      randomUser = getRandomElement(userAccounts)
    }
    userTaskRegistry[randomUser]++
    const hexId = web3.utils.toHex(tasks[i])
    const hexUser =  web3.utils.toHex(randomUser)
    const { transactionHash } = await callContractMethod('allocateTask', [hexId, hexUser])
    console.log(`Task ${tasks[i]} created. Tx hash: ${transactionHash}`)
  }
}

function getRandomElement(elements) {
  return elements[Math.floor(Math.random() * elements.length)]
}

exports.generateMockData = async () => {
  // Register amara users
  // registerMockUserAccounts(users)
  const tasksIds = await getInitialTasksIds(tasks, 4)
  // // Create and allocate tasks
  createMockTasks(tasksIds)
  // allocateMockTasks(tasksIds, users)
}
