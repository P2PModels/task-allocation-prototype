import { Address, SubscriptionHandler } from '@aragon/connect-core'
import { SubscriptionCallback, IRoundRobinConnector } from '../types'
import Config from './Config'
import Task from './Task'
import User from './User'

export default class RoundRobin {
  #address: Address
  #connector: IRoundRobinConnector

  constructor(connector: IRoundRobinConnector, address: Address) {
    this.#connector = connector
    this.#address = address
  }

  async disconnect(): Promise<void> {
    this.#connector.disconnect()
  }

  onConfig(callback: SubscriptionCallback<Config>): SubscriptionHandler {
    return this.#connector.onConfig(this.#address, callback)
  }

  async user(userId: string): Promise<User> {
    return this.#connector.user(this.#address, userId)
  }

  onUser(
    userId: string,
    callback: SubscriptionCallback<User>
  ): SubscriptionHandler {
    return this.#connector.onUser(this.#address, userId, callback)
  }

  async tasksForUser(
    userId: string,
    status: string,
    { first = 1000, skip = 0 } = {}
  ): Promise<Task[]> {
    return this.#connector.tasksForUser(
      this.#address,
      userId,
      status,
      first,
      skip
    )
  }

  onTasksForUser(
    userId: string,
    status: string,
    { first = 1000, skip = 0 } = {},
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler {
    return this.#connector.onTasksForUser(
      this.#address,
      userId,
      status,
      first,
      skip,
      callback
    )
  }

  async rejectedTasksForUser(
    userId: string,
    { first = 1000, skip = 0 } = {}
  ): Promise<Task[]> {
    return this.#connector.rejectedTasksForUser(this.#address, userId)
  }

  onRejectedTasksForUser(
    userId: string,
    { first = 1000, skip = 0 } = {},
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler {
    return this.#connector.onRejectedTasksForUser(
      this.#address,
      userId,
      callback
    )
  }
}
