import { IRoundRobinConnector, TaskData, UserData } from '../types'

export default class Task {
  #connector: IRoundRobinConnector

  readonly id: string
  readonly endDate: string
  readonly status: string
  readonly reallocationTime: string
  readonly assignee: UserData
  // readonly rejecterUsers: UserData[]

  constructor(data: TaskData, connector: IRoundRobinConnector) {
    this.#connector = connector

    this.id = data.id
    this.endDate = data.endDate
    this.status = data.status
    this.reallocationTime = data.reallocationTime
    this.assignee = data.assignee
    // this.rejecterUsers = data.rejecterUsers
  }
}
