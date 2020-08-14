import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { events } from '@aragon/api'

import { app, eventTypes, eventHandlers } from './store'

const {
  ACCOUNT_DISCONNECTED,
  ACCOUNT_SELECTED,
  API_URL_SET,
  TASK_ASSIGNED,
  TASKS_RESTART,
  TASK_ALLOCATED,
  TASK_ACCEPTED,
} = eventTypes

const { taskAllocated, taskAccepted } = eventHandlers

app.store(async (state, { event, returnValues }) => {
  const nextState = {
    ...state,
  }
  console.log(event)
  try {
    switch (event) {
      case ACCOUNT_DISCONNECTED:
        app.cache('amara', null).toPromise()
        return { ...nextState, amara: null }
      case ACCOUNT_SELECTED: {
        const { amara } = returnValues
        app.cache('amara', amara).toPromise()
        return { ...nextState, amara }
      }
      case API_URL_SET: {
        const { apiUrl } = returnValues
        return { ...nextState, apiUrl }
      }
      case TASK_ASSIGNED: {
        const { userId, taskId } = returnValues
        const userTasks =
          nextState.tasks && nextState.tasks[userId]
            ? nextState.tasks[userId]
            : []
        return {
          ...nextState,
          tasks: { ...nextState.tasks, [userId]: [...userTasks, taskId] },
        }
      }
      case TASKS_RESTART: {
        return {
          tasks: {},
          apiUrl: nextState.apiUrl,
          amara: { ...nextState.amara },
        }
      }
      // ROUND ROBIN
      case TASK_ALLOCATED: {
        return taskAllocated(nextState, returnValues)
      }
      case TASK_ACCEPTED: {
        return taskAccepted(nextState, returnValues)
      }
      case events.SYNC_STATUS_SYNCING:
        return { ...nextState, isSyncing: true }
      case events.SYNC_STATUS_SYNCED:
        return { ...nextState, isSyncing: false }
      default:
        return state
    }
  } catch (err) {
    console.log(err)
  }
})

/***********************
 *   Initializer Function    *
 ***********************/

// function initializeState() {
//   return async cachedState => {
//     const nextState = {}
//     // console.log('The cache state is')
//     // console.log(cachedState)
//     // const amara = await app.getCache('amara').toPromise()
//     // if (amara) nextState.amara = amara
//     // else nextState.amara = null

//     // nextState.apiUrl = null
//     // nextState.account = null
//     console.log('Initial state')
//     console.log(nextState)
//     return nextState
//   }
// }
