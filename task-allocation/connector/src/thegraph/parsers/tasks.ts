import { QueryResult } from '@aragon/connect-thegraph'
import { ErrorUnexpectedResult } from 'src/errors'
import Task from 'src/models/Task'
import { TaskData } from 'src/types'

export function parseTasks(result: QueryResult, connector: any): Task[] {
  const tasks = result.data.tasks

  if (!tasks) throw new ErrorUnexpectedResult('Unable to parse tasks.')

  const datas = tasks.map((t: TaskData) => t)

  return datas.map((data: TaskData) => new Task(data, connector))
}

export function parseRejectedTasks(
  result: QueryResult,
  connector: any
): Task[] {
  const rejectedTasks =
    result.data.user && result.data.user.length
      ? result.data.user[0].rejectedTasks
      : null

  if (!rejectedTasks)
    throw new ErrorUnexpectedResult('Unable to parse rejected tasks.')

  const datas = rejectedTasks.map((t: TaskData) => t)

  return datas.map((data: TaskData) => new Task(data, connector))
}
