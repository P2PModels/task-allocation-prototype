// const { web3 } = require('./ethereum/web3')
// const { timestampToHour, timestampToDate } = require('./ethereum/web3-utils')
// const {
//   users,
//   tasks,
// } = require('./ethereum/task-allocation-models/round-robin/mock-data')
// const {
//   getRRContract,
// } = require('./ethereum/task-allocation-models/round-robin/round-robin')

// // web3.utils.toHex(id)
// const { hexToAscii, toHex } = web3.utils
// const rrContract = getRRContract()
// const userFields = [
//   'index',
//   'benefits',
//   'available',
//   'exists',
//   'allocatedTasksLength',
// ]
// const taskFields = [
//   'assignee',
//   'allocationIndex',
//   'endDate',
//   'status',
//   'reallocationTime',
// ]
// const maxTasks = 4
// const tIds = tasks.map(({ job_id: taskId }) => taskId)
// const tasksIds = tIds.slice(0, maxTasks)

// async function testUserLength() {
//   const l = await rrContract.methods.getUserLength().call()
//   console.log(`userLength: ${l}`)
// }

// async function getAllUsers(users) {
//   for (const u of users) {
//     await getUser(u)
//   }
//   console.log('==============================')
//   console.log('==============================')
// }

// async function getAllTasks(tasks, users) {
//   for (const t of tasks) {
//     await getTask(t, users)
//   }
//   console.log('==============================')
//   console.log('==============================')
// }

// async function getUser(userId) {
//   const uId = web3.utils.toHex(userId)
//   const res = await rrContract.methods.getUser(uId).call()

//   if (res.exists) {
//     const allocatedTasks = await getUserAllocatedTasks(
//       uId,
//       res.allocatedTasksLength
//     )
//     console.log('User ' + userId)
//     console.log(' ')
//     userFields.forEach(field => {
//       const value = res[field]

//       console.log(`${field}: ${value}`)
//     })
//     if (allocatedTasks.length === 0) console.log('No allocated tasks')
//     else {
//       allocatedTasks.forEach((t, index) => console.log(`- Task ${index}: ${t}`))
//     }
//     console.log('--------------------------')
//   }
// }

// async function getUserAllocatedTasks(uId, allocatedTasksLength) {
//   const taskPromises = []
//   for (let i = 0; i < allocatedTasksLength; i++) {
//     const t = await rrContract.methods.getAllocatedTask(uId, i).call()
//     taskPromises.push(hexToAscii(t))
//   }
//   return taskPromises
// }

// async function getTask(taskId, users) {
//   const tId = toHex(taskId)
//   const res = await rrContract.methods.getTask(tId).call()
//   if (Number(res.status) !== 0) {
//     const rejecters = await getRejecters(tId, users)
//     console.log('Task ' + taskId)
//     console.log(' ')
//     taskFields.forEach(field => {
//       let value = res[field]
//       if (field === 'reallocationTime') value = `${value}s`
//       else if (field === 'assignee') value = hexToAscii(value)
//       else if (field === 'endDate') value = timestampToDate(value)
//       console.log(`${field}: ${value}`)
//     })
//     if (rejecters.length === 0) console.log('No rejecters')
//     else {
//       console.log('Rejecters')
//       rejecters.forEach(u => console.log(`- User ${u}`))
//     }
//     console.log('--------------------------')
//   }
// }

// async function getRejecters(tId, users) {
//   const promises = users.map(u =>
//     rrContract.methods.getRejecter(tId, toHex(u)).call()
//   )
//   const rejecters = await (await Promise.all(promises))
//     .map((rejected, index) => ({ name: users[index], rejected }))
//     .filter(user => user.rejected)
//     .map(user => user.name)
//   return rejecters
// }

// async function acceptTask(userId, taskId) {
//   const uId = web3.utils.toHex(userId)
//   const tId = web3.utils.toHex(taskId)
//   await rrContract.methods.acceptTask(uId, tId).send()
// }

// async function rejectTask(userId, taskId) {
//   const uId = web3.utils.toHex(userId)
//   const tId = web3.utils.toHex(taskId)
//   await rrContract.methods.rejectTask(uId, tId).send()
// }

// async function restartApp() {
//   await rrContract.methods.restart().send()
// }

// async function start() {
//   // await rejectTask(users[0], tasksIds[2])
//   // await acceptTask(users[2], tasksIds[3])
//   // await restartApp()
//   await getAllUsers(users)
//   await getAllTasks(tasksIds, users)
// }

// // start()

// const d = new Date()
// console.log(d.toISOString())
// d.setHours(d.getHours() + 8)
// console.log(d.toISOString())