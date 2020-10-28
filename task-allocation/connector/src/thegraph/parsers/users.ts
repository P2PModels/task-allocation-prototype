import { QueryResult } from '@aragon/connect-thegraph'
import { ErrorUnexpectedResult } from 'src/errors'
import User from 'src/models/User'

export function parseUser(result: QueryResult, connector: any): User | null {
  const users = result.data.users

  if (!users) throw new ErrorUnexpectedResult('Unable to parse user.')

  const user = users[0]

  return user ? new User(user, connector) : null
}
