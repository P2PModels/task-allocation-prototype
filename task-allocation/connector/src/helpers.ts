export function buildTaskId(appAddress: string, taskId: string) {
  return `appAddress:${appAddress}-taskId:${taskId}`
}

export function buildUserId(appAddress: string, userId: string) {
  return `appAddress:${appAddress}-taskId:${userId}`
}
