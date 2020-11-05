const { CronJob, CronTime } = require('cron')

const { web3 } = require('../../web3')
const { timestampToDate, timestampToHour } = require('../../web3-utils')
const { hexToAscii } = web3.utils
const logger = require('../../../winston')

const { rrContract } = require('./round-robin')

const USER_REGISTERED = 'UserRegistered'
const USER_DELETED = 'UserDeleted'
const TASK_CREATED = 'TaskCreated'
const TASK_ALLOCATED = 'TaskAllocated'
const TASK_ACCEPTED = 'TaskAccepted'
const TASK_REJECTED = 'TaskRejected'
const TASK_DELETED = 'TaskDeleted'

const cronJobs = new Map()


function userRegisteredHandler(err, { returnValues: { userId } }) {
  if (err) logger.error(`Error when receiving ${USER_REGISTERED} event - ${err}`)
  else {
    logger.info(`${USER_REGISTERED} event - User ${hexToAscii(userId)} created`)
  }
}

function userDeletedHandler(err, { returnValues: { userId } }) {
  if (err) logger.error(`Error when receiving ${USER_DELETED} event - ${err}`)
  else {
    logger.info(`${USER_DELETED} event - User ${hexToAscii(userId)} deleted`)
  }
}

function taskCreatedHandler(err, { returnValues: { taskId } }) {
  if (err) logger.error(`Error when receiving ${TASK_CREATED} event - ${err}`)
  else {
    logger.info(`${TASK_CREATED} event - Task ${hexToAscii(taskId)} created`)
  }
}

async function taskAllocatedHandler(err, { returnValues: { taskId, userId } }) {
  if (err) logger.error(`Error when receiving ${TASK_ALLOCATED} event - ${err}`)
  else {
    const { endDate } = await rrContract.methods.getTask(taskId).call()

    logger.info(
      `${TASK_ALLOCATED} event - Task ${hexToAscii(taskId)} has been assigned to ${hexToAscii(userId)} and will be reassigned on ${timestampToHour(endDate)}`
    )

    let cronJob
    if (cronJobs.has(taskId)) {
      cronJob = cronJobs.get(taskId)
      cronJob.setTime(new CronTime(timestampToDate(endDate)))
    } else {
      cronJob = createReallocationCronJob(taskId, endDate)
      cronJobs.set(taskId, cronJob)
    }
    cronJob.start()
  }
}

function taskRejectedHandler(err, { returnValues: { taskId, userId } }) {
  if (err) logger.error(`Error when receiving ${TASK_REJECTED} event - ${err}`)
  else {
    logger.info(
      `${TASK_REJECTED} event - Task ${hexToAscii(taskId)} rejected by ${hexToAscii(userId)}`
    )
  }
}

function taskAcceptedHandler(err, event) {
  const { taskId, userId } = event.returnValues
  if (err) logger.error(`Error when receiving ${TASK_ACCEPTED} event - ${err}`)
  else {
    logger.info(`${TASK_ACCEPTED} event - Task ${hexToAscii(taskId)} accepted by user ${hexToAscii(userId)}`)
    if (cronJobs.has(taskId)) cronJobs.get(taskId).stop()
  }
}

function taskDeletedHandler(err, event) {
  const { taskId } = event.returnValues
  if (err) logger.error(`Error when receiving ${TASK_DELETED} event - ${err}`)
  else {
    logger.info(`${TASK_DELETED} event - Task ${hexToAscii(taskId)} deleted`)
    if (cronJobs.has(taskId)) cronJobs.get(taskId).stop()
  }
}

function createReallocationCronJob(taskId, timestamp) {
  const executionDate = timestampToDate(timestamp)

  return new CronJob(executionDate, function () {
    logger.info(`Executing job with task id: ${hexToAscii(taskId)} on ${executionDate}`)
    rrContract.methods
      .reallocateTask(taskId)
      .send()
      .then(
        () => {},
        err => {
          logger.error(`Error trying to reallocate task ${taskId} - ${err}`)
        }
      )
  })
}

exports.setUpEventListeners = async () => {
  rrContract.events[USER_REGISTERED]({}, userRegisteredHandler)
  rrContract.events[USER_DELETED]({}, userDeletedHandler)
  rrContract.events[TASK_CREATED]({}, taskCreatedHandler)
  rrContract.events[TASK_ALLOCATED]({}, taskAllocatedHandler)
  rrContract.events[TASK_ACCEPTED]({}, taskAcceptedHandler)
  rrContract.events[TASK_REJECTED]({}, taskRejectedHandler)
  rrContract.events[TASK_DELETED]({}, taskDeletedHandler)

  logger.info('Round Robin Events Listener set up')
}
