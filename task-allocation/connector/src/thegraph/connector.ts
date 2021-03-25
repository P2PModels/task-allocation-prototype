import { GraphQLWrapper, QueryResult } from '@aragon/connect-thegraph'
import { SubscriptionHandler } from '@aragon/connect-core'
import { SubscriptionCallback, IRoundRobinConnector, Address } from '../types'
import Task from '../models/Task'
import User from '../models/User'
import Config from '../models/Config'
import * as queries from './queries'

import { parseConfig, parseTasks, parseUser } from './parsers'
import { buildUserEntityId } from '../helpers'
import { parseRejectedTasks } from './parsers/tasks'

export function subgraphUrlFromChainId(chainId: number): string | null {
  // Rinkeby
  if (chainId === 4) {
    return 'https://api.thegraph.com/subgraphs/name/p2pmodels/aragon-rr-rinkeby-staging'
  }
  return null
}

type RoundRobinConnectorTheGraphConfig = {
  pollInterval?: number
  subgraphUrl?: string
  verbose?: boolean
}

export default class RoundRobinConnectorTheGraph
  implements IRoundRobinConnector {
  #gql: GraphQLWrapper

  constructor(config: RoundRobinConnectorTheGraphConfig) {
    if (!config.subgraphUrl) {
      throw new Error(
        'RoundRobinConnectorTheGraph requires subgraphUrl to be passed.'
      )
    }
    this.#gql = new GraphQLWrapper(config.subgraphUrl, {
      pollInterval: config.pollInterval,
      verbose: config.verbose,
    })
  }

  async disconnect() {
    this.#gql.close()
  }

  onConfig(
    id: string,
    callback: SubscriptionCallback<Config>
  ): SubscriptionHandler {
    return this.#gql.subscribeToQueryWithParser(
      queries.CONFIG('subscription'),
      { id },
      callback,
      (result: QueryResult) => parseConfig(result, this)
    )
  }

  async user(appAddress: string, userId: string): Promise<User> {
    const id = buildUserEntityId(appAddress, userId)
    return this.#gql.performQueryWithParser(
      queries.USER('query'),
      { id },
      (result: QueryResult) => parseUser(result, this)
    )
  }

  onUser(
    appAddress: string,
    userId: string,
    callback: SubscriptionCallback<User>
  ): SubscriptionHandler {
    const id = buildUserEntityId(appAddress, userId)
    return this.#gql.subscribeToQueryWithParser(
      queries.USER('subscription'),
      { id },
      callback,
      (result: QueryResult) => parseUser(result, this)
    )
  }

  async tasksForUser(
    appAddress: string,
    userId: string,
    statuses: number[],
    first: number,
    skip: number
  ): Promise<Task[]> {
    const id = buildUserEntityId(appAddress, userId)
    return this.#gql.performQueryWithParser(
      queries.USER_TASKS_BY_STATUS('query'),
      { statuses, userId: id, first, skip },
      (result: QueryResult) => parseTasks(result, this)
    )
  }

  onTasksForUser(
    appAddress: string,
    userId: string,
    statuses: number[],
    first: number,
    skip: number,
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler {
    const id = buildUserEntityId(appAddress, userId)

    return this.#gql.subscribeToQueryWithParser(
      queries.USER_TASKS_BY_STATUS('subscription'),
      { statuses, userId: id, first, skip },
      callback,
      (result: QueryResult) => parseTasks(result, this)
    )
  }

  async rejectedTasksForUser(
    appAddress: string,
    userId: string
    // first: number,
    // skip: number
  ): Promise<Task[]> {
    const id = buildUserEntityId(appAddress, userId)
    return this.#gql.performQueryWithParser(
      queries.USER_REJECTED_TASKS('query'),
      { id },
      (result: QueryResult) => parseRejectedTasks(result, this)
    )
  }

  onRejectedTasksForUser(
    appAddress: string,
    userId: string,
    // first: number,
    // skip: number,
    callback: SubscriptionCallback<Task[]>
  ): SubscriptionHandler {
    const id = buildUserEntityId(appAddress, userId)
    return this.#gql.subscribeToQueryWithParser(
      queries.USER_REJECTED_TASKS('subscription'),
      { id },
      callback,
      (result: QueryResult) => parseRejectedTasks(result, this)
    )
  }
}
