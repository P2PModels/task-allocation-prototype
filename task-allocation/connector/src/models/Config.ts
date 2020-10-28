import { ConfigData, IRoundRobinConnector } from '../types'

export default class Config {
  #connector: IRoundRobinConnector

  readonly id: string
  readonly maxAllocatedTasks: number

  constructor(data: ConfigData, connector: IRoundRobinConnector) {
    this.#connector = connector

    this.id = data.id
    this.maxAllocatedTasks = data.maxAllocatedTasks
  }
}
