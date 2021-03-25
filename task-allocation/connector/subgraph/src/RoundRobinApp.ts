import { store, log } from '@graphprotocol/graph-ts'
import {
  TaskCreated as TaskCreatedEvent,
  TaskDeleted as TaskDeletedEvent,
  TaskAccepted as TaskAcceptedEvent,
  TaskRejected as TaskRejectedEvent,
  TaskAllocated as TaskAllocatedEvent,
  UserRegistered as UserRegisteredEvent,
  UserDeleted as UserDeletedEvent,
  RejecterDeleted as RejecterDeletedEvent,
} from '../generated/templates/RoundRobinApp/RoundRobinApp'
import {
  STATUS_ACCEPTED,
  STATUS_ACCEPTED_NUM,
  STATUS_ASSIGNED,
  STATUS_ASSIGNED_NUM,
  STATUS_REJECTED,
  STATUS_REJECTED_NUM,
} from './task-statuses'
import {
  populateTaskDataFromContract,
  getTaskEntity,
  getUserEntity,
  getUserRejectedTaskEntity,
} from './helpers'

export function handleTaskCreated(event: TaskCreatedEvent): void {
  const task = getTaskEntity(event.address, event.params.taskId)
  log.debug('Task created. taskId: {}', [event.params.taskId.toString()])
  task.save()
}

export function handleTaskDeleted(event: TaskDeletedEvent): void {
  const task = getTaskEntity(event.address, event.params.taskId)

  log.debug('TaskDeleted event received. taskId: {}', [
    event.params.taskId.toString(),
  ])

  store.remove('Task', task.id)
}

export function handleTaskAccepted(event: TaskAcceptedEvent): void {
  const user = getUserEntity(event.address, event.params.userId)
  const task = getTaskEntity(event.address, event.params.taskId)

  log.debug('TaskAccepted event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])
  // assignee field is already set on task allocation event handler
  // (can't accept a task that wasnt assign to someone previously)
  // Nevertheless we set the field again just in case.
  task.assignee = user.id
  task.status = STATUS_ACCEPTED
  task.statusInt = STATUS_ACCEPTED_NUM

  task.save()
}

export function handleTaskRejected(event: TaskRejectedEvent): void {
  const userRejectedTask = getUserRejectedTaskEntity(
    event.address,
    event.params.userId,
    event.params.taskId
  )
  const task = getTaskEntity(event.address, event.params.taskId)

  log.debug('TaskRejected event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  task.assignee = null
  task.status = STATUS_REJECTED
  task.statusInt = STATUS_REJECTED_NUM

  task.save()
  userRejectedTask.save()
}

export function handleTaskAllocated(event: TaskAllocatedEvent): void {
  const task = getTaskEntity(event.address, event.params.taskId)
  const user = getUserEntity(event.address, event.params.userId)

  log.debug('TaskAllocated event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  populateTaskDataFromContract(event.address, task, event.params.taskId)

  task.status = STATUS_ASSIGNED
  task.statusInt = STATUS_ASSIGNED_NUM
  task.assignee = user.id

  task.save()
}

export function handleUserRegistered(event: UserRegisteredEvent): void {
  const user = getUserEntity(event.address, event.params.userId)

  log.debug('UserRegistered event received. entity id: {}', [user.id])

  user.save()
}

export function handleUserDeleted(event: UserDeletedEvent): void {
  const user = getUserEntity(event.address, event.params.userId)

  log.debug('UserDeleted event received. userId: {}', [
    event.params.userId.toString(),
  ])

  store.remove('User', user.id)
}

export function handleRejecterDeleted(event: RejecterDeletedEvent): void {
  const userRejectedTask = getUserRejectedTaskEntity(
    event.address,
    event.params.userId,
    event.params.taskId
  )

  log.debug('RejecterDeleted event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  store.remove('UserRejectedTask', userRejectedTask.id)
}
