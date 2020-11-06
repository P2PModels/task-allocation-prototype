# The Graph Connector for Round Robin

Connector for the Task Allocation Round Robin model prototype.

## Usage

```js
  const org = await connect(ORG_ADDRESS, 'thegraph', { network: 4 })

  const roundRobinApp = await org.app('ta-round-robin')

  const roundRobinConnector = await createAppConnector(roundRobinApp)

  const proposals = await roundRobinConnector.tasksForUser(<userId>, <status>, { first: <first>, skip: <skip> })
```
