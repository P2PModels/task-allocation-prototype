import { QueryResult } from '@aragon/connect-thegraph'
import { ErrorUnexpectedResult } from '../../errors'
import User from '../../models/User'
import { TaskData, ASSIGNED_STATUS, ACCEPTED_STATUS } from '../../types'

export function parseUser(result: QueryResult, connector: any): User | null {
  const user = result.data.user

  if (!user) throw new ErrorUnexpectedResult('Unable to parse user.')

  const data = {
    ...user,
  }
  return user ? new User(data, connector) : null
}
