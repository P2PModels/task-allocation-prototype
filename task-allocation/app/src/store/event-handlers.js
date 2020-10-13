import { ADD_TASK, REMOVE_TASK, updateTasks, UPDATE_TASK } from './helpers'

export async function taskAllocated(state, returnValues) {
  const { tasks = {} } = state
  const transform = (userTasks, task, operation) => {
    switch (operation) {
      case REMOVE_TASK:
        return {
          ...userTasks,
          availableTasks: userTasks.availableTasks.filter(
            ({ id }) => id !== task.id
          ),
        }
      case ADD_TASK:
        return {
          ...userTasks,
          availableTasks: [...userTasks.availableTasks, task],
        }
      case UPDATE_TASK: {
        const foundTaskIndex = userTasks.availableTasks.findIndex(
          t => t.id === task.id
        )
        if (foundTaskIndex >= 0) {
          userTasks.availableTasks[foundTaskIndex] = { ...task }
        }
        return {
          ...userTasks,
        }
      }
    }
  }
  return {
    ...state,
    tasks: await updateTasks(tasks, returnValues, transform),
  }
}

export async function taskAccepted(state, returnValues) {
  const { tasks = {} } = state
  const transform = (userTasks, task) => {
    return {
      ...userTasks,
      availableTasks: userTasks.availableTasks.filter(
        ({ id }) => id !== task.id
      ),
      acceptedTasks: [...userTasks.acceptedTasks, { ...task, endDate: null }],
    }
  }
  return {
    ...state,
    tasks: await updateTasks(tasks, returnValues, transform),
  }
}

export async function rejectTask(state, returnValues) {}
