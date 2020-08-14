import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { useAragonApi } from '@aragon/api-react'
import AmaraApi from '../amara-api'

const UserTasksContext = createContext()

function initUserTasksState() {
  return {
    availableTasks: [],
    acceptedTasks: [],
  }
}
export function useUserTasks() {
  const context = useContext(UserTasksContext)

  if (!context) {
    throw new Error(
      'useUserAssingments must be used within a AssingmentsProvider'
    )
  }

  return context
}

export function UserTasksProvider(props) {
  const {
    appState: { tasks, amara, apiUrl },
  } = useAragonApi()
  const [userTasksState, setUserTasksState] = useReducer(
    (prevState, state) => ({
      ...prevState,
      ...state,
    }),
    initUserTasksState()
  )
  useEffect(() => {
    async function fetchTaskData(taskType) {
      const { id, teams } = amara
      return await Promise.all(
        tasks[id][taskType].map(async t => {
          const fetchedTask = AmaraApi.teams.getTeamSubtitleRequest(
            teams[0],
            t.id
          )
          return {
            ...fetchedTask,
            ...t,
          }
        })
      )
    }

    const fetchAllTasks = async () => {
      AmaraApi.setBaseUrl(apiUrl)
      const availableTasks = await fetchTaskData('availableTasks')
      const acceptedTasks = await fetchTaskData('acceptedTasks')
      setUserTasksState({
        availableTasks,
        acceptedTasks,
      })
    }
    if (apiUrl) {
      fetchAllTasks()
    }
  }, [apiUrl, tasks])

  return <UserTasksContext.Provider value={userTasksState} {...props} />
}
