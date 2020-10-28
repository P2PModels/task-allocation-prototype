import { SubscriptionHandler } from '@aragon/connect-core'
import { IRoundRobinConnector, SubscriptionCallback, UserData } from '../types'
import Task from './Task'

export default class User {
  #connector: IRoundRobinConnector

  readonly id: string
  readonly benefits: string
  readonly available: boolean
  readonly appAddress: string
  // readonly allocatedTasks: TaskData[]
  // readonly acceptedTasks: TaskData[]
  // readonly rejectedTasks: TaskData[]

  constructor(data: UserData, connector: IRoundRobinConnector) {
    this.#connector = connector

    this.id = data.id
    this.benefits = data.benefits
    this.available = data.available
    this.appAddress = data.appAddress
    // this.allocatedTasks = data.allocatedTasks
    // this.acceptedTasks = data.acceptedTasks
    // this.rejectedTasks = data.rejectedTasks
  }

  // async allocatedTasks({ first = 1000, skip = 0 } = {}): Promise<Task[]> {
  //   return this.#connector.allocatedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip
  //   )
  // }

  // onAllocatedTasks(
  //   { first = 1000, skip = 0 } = {},
  //   callback: SubscriptionCallback<Task[]>
  // ): SubscriptionHandler {
  //   return this.#connector.onAllocatedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip,
  //     callback
  //   )
  // }

  // async acceptedTasks({ first = 1000, skip = 0 } = {}): Promise<Task[]> {
  //   return this.#connector.acceptedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip
  //   )
  // }

  // onAcceptedTasks(
  //   { first = 1000, skip = 0 } = {},
  //   callback: SubscriptionCallback<Task[]>
  // ): SubscriptionHandler {
  //   return this.#connector.onAcceptedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip,
  //     callback
  //   )
  // }

  // async rejectedTasks({ first = 1000, skip = 0 } = {}): Promise<Task[]> {
  //   return this.#connector.rejectedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip
  //   )
  // }

  // onRejectedTasks(
  //   { first = 1000, skip = 0 } = {},
  //   callback: SubscriptionCallback<Task[]>
  // ): SubscriptionHandler {
  //   return this.#connector.onRejectedTasksForUser(
  //     this.appAddress,
  //     this.id,
  //     first,
  //     skip,
  //     callback
  //   )
  // }
}
