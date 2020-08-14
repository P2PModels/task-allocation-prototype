import { hexToString } from 'web3-utils'
import app from '../app'

import { hexPropertiesToString, retryEvery } from './utils'

export const INITIAL_USER_TASKS = { availableTasks: [], acceptedTasks: [] }
export const ADD_TASK = Symbol('ADD_TASK')
export const REMOVE_TASK = Symbol('REMOVE_TASK')

export async function updateTasks(tasks, returnValues, transform) {
  const { taskId: hexTaskId } = returnValues
  const { userId, previousUserId } = hexPropertiesToString(returnValues)
  const newTasks = { ...tasks }
  const task = await loadTaskData(hexTaskId)
  const userTasks = getUserTasks(tasks, userId)

  newTasks[userId] = transform(userTasks, task, ADD_TASK)

  if (previousUserId) {
    const previousUserTasks = getUserTasks(tasks, previousUserId)
    newTasks[previousUserId] = transform(previousUserTasks, task, REMOVE_TASK)
  }

  return newTasks
}

export function loadTaskData(taskId) {
  return retryEvery(() =>
    app
      .call('getTask', taskId)
      .toPromise()
      .then(endDate => {
        return {
          // ...removeNumberProperties(task),
          id: hexToString(taskId),
          endDate: new Date(1000 * endDate),
        }
      })
      .catch(err => {
        console.error(`Error fetching task ${taskId}`, err)
        throw err
      })
  )
}

export function getUserTasks(tasks, userId) {
  return tasks[userId] ? tasks[userId] : INITIAL_USER_TASKS
}
