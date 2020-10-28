import { ErrorUnexpectedResult } from '../../errors'
import { QueryResult } from '@aragon/connect-thegraph'
import Config from 'src/models/Config'

export function parseConfig(
  result: QueryResult,
  connector: any
): Config | null {
  const configs = result.data.configs

  if (!configs) throw new ErrorUnexpectedResult('Unable to parse config.')

  const config = configs[0]

  return config ? new Config(config, connector) : null
}
