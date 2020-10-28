import Config from './models/Config'
import Task from './models/Task'
import User from './models/User'

export type SubscriptionHandler = { unsubscribe: () => void }
export type SubscriptionCallback<T> = (error: Error | null, data?: T) => void
export type Address = string

export interface ConfigData {
  id: string
  maxAllocatedTasks: number
  appAddress: string
}

export interface TaskData {
  id: string
  endDate: string
  status: string
  reallocationTime: string
  assignee: UserData
  // rejecterUsers: UserData[]
  appAddress: string
}

export interface UserData {
  id: string
  benefits: string
  available: boolean
  allocatedTasks: TaskData[]
  acceptedTasks: TaskData[]
  rejectedTasks: TaskData[]
  appAddress: string
}

export interface UserRejectedTaskData {
  id: string
  user: UserData
  task: TaskData
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IRoundRobinConnector {
  disconnect(): Promise<void>
  onConfig(
    id: string,
    callback: SubscriptionCallback<Config>
  ): SubscriptionHandler
  user(appAddress: string, user: string): Promise<User>
  onUser(
    appAddress: string,
    user: string,
    callback: SubscriptionCallback<User>
  ): SubscriptionHandler
  tasksForUser(
    appAddress: string,
    userId: string,
    status: string,
    first: number,
    skip: number
  ): Promise<Task[]>
  onTasksForUser(
    appAddress: string,
    userId: string,
    status: string,
    first: number,
    skip: number,
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler
  rejectedTasksForUser(
    appAddress: string,
    userId: string
    // first: number,
    // skip: number
  ): Promise<Task[]>
  onRejectedTasksForUser(
    appAddress: string,
    userId: string,
    // first: number,
    // skip: number,
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler
}
