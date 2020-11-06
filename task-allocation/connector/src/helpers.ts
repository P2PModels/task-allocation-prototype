export function buildTaskEntityId(appAddress: string, taskId: string) {
  return `appAddress:${appAddress}-taskId:${taskId}`
}

export function buildUserEntityId(appAddress: string, userId: string) {
  return `appAddress:${appAddress}-userId:${userId}`
}
