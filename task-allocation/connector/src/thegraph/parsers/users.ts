import { QueryResult } from '@aragon/connect-thegraph'
import { ErrorUnexpectedResult } from '../../errors'
import User from '../../models/User'

export function parseUser(result: QueryResult, connector: any): User | null {
  const user = result.data.user

  if (!user) throw new ErrorUnexpectedResult('Unable to parse user.')

  return user ? new User(user, connector) : null
}
