import { createAppConnector } from '@aragon/connect-core'
import {
  ErrorInvalidApp,
  ErrorInvalidConnector,
  ErrorInvalidNetwork,
} from './errors'
import RoundRobin from './models/RoundRobin'
import RoundRobinConnectorTheGraph, {
  subgraphUrlFromChainId,
} from './thegraph/connector'

type Config = {
  pollInterval?: number
  subgraphUrl?: string
}

export default createAppConnector<RoundRobin, Config>(
  ({ app, config, connector, network, orgConnector, verbose }) => {
    if (connector !== 'thegraph') {
      throw new ErrorInvalidConnector(
        `Connector unsupported: ${connector}. Please use thegraph.`
      )
    }

    if (app.name !== 'ta-round-robin.open.aragonpm.eth') {
      throw new ErrorInvalidApp(
        `This app (${app.name}) is not compatible with connect-roundrobin. ` +
          `Please use an app instance of the ta-round-robin.open.aragonpm.eth repo.`
      )
    }

    const subgraphUrl =
      config.subgraphUrl ?? subgraphUrlFromChainId(network.chainId) ?? undefined

    if (!subgraphUrl) {
      throw new ErrorInvalidNetwork(
        'No subgraph could be found for this network. ' +
          'Please provide a subgraphUrl or use one of the supported networks.'
      )
    }

    let pollInterval
    if (orgConnector.name === 'thegraph') {
      pollInterval =
        config?.pollInterval ?? orgConnector.config?.pollInterval ?? undefined
    }

    const connectorTheGraph = new RoundRobinConnectorTheGraph({
      pollInterval,
      subgraphUrl,
      verbose,
    })

    return new RoundRobin(connectorTheGraph, app.address)
  }
)
