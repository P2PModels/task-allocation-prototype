import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

const app = new Aragon()

app.store(
  async (state, { event, returnValues }) => {
    const nextState = {
      ...state,
    }
    console.log(event)
    try {
      switch (event) {
        case 'AccountDisconnected':
          app.cache('amara', null).toPromise()
          return { ...nextState, amara: null}
        case 'AccountSelected':
          const { amara } = returnValues
          app.cache('amara', amara).toPromise()
          return { ...nextState, amara }
        case 'ApiUrlSet':
          const { apiUrl } = returnValues
          return { ...nextState, apiUrl }
        case 'TaskAssigned':
          const { userId, taskId } = returnValues
          const userTasks =
            nextState.tasks && nextState.tasks[userId]
              ? nextState.tasks[userId]
              : []
          return {
            ...nextState,
            tasks: { ...nextState.tasks, [userId]: [...userTasks, taskId] },
          }
        case 'TasksRestart':
          return { tasks: {}, apiUrl: nextState.apiUrl, amara: { ...nextState.amara }}
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
  },
  {
    init: initializeState(),
  }
)

/***********************
 *   Event Handlers    *
 ***********************/

function initializeState() {
  return async cachedState => {
    let nextState = { ...cachedState }
    const amara = await app.getCache('amara').toPromise()
    if(amara) 
      nextState.amara = amara
    else
      nextState.amara = null
  
    nextState.apiUrl = null
    nextState.account = null
    console.log('Initial state')
    console.log(nextState)
    return nextState
  }
}
