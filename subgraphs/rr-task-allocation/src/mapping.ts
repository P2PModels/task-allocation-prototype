import { store, log, BigInt } from '@graphprotocol/graph-ts'

import {
  TaskCreated as TaskCreatedEvent,
  TaskDeleted as TaskDeletedEvent,
  TaskAccepted as TaskAcceptedEvent,
  TaskRejected as TaskRejectedEvent,
  TaskAllocated as TaskAllocatedEvent,
  UserRegistered as UserRegisteredEvent,
  UserDeleted as UserDeletedEvent,
  RejecterDeleted as RejecterDeletedEvent,
  TasksRestart as TasksRestartEvent,
  RoundRobinTAA
} from '../generated/RoundRobinTAA/RoundRobinTAA'
import {
  STATUS_AVAILABLE,
  STATUS_ACCEPTED,
  STATUS_ASSIGNED,
  STATUS_REJECTED,
} from './task-statuses'
import { Task, User } from "../generated/schema"

export function handleTaskCreated(event: TaskCreatedEvent): void {

  let contract = RoundRobinTAA.bind(event.address)
  let task = contract.getTask(event.params.taskId)
  log.debug('Created task: assignee {} allocationIndex {} endDate {} status symbol {} reallocationTime {}', [
    task.value0.toString(),
    task.value1.toString(),
    task.value2.toString(),
    task.value3.toString(),
    task.value4.toString(),
  ])

  let taskEntity = Task.load(event.params.taskId.toString())

  if (taskEntity == null) {
    taskEntity = new Task(event.params.taskId.toString())
  }

  taskEntity.endDate = task.value2
  taskEntity.reallocationTime = task.value4
  taskEntity.status = STATUS_AVAILABLE
  taskEntity.rejecterUsers = []

  log.debug('Created task: id {}  endDate {} reallocationTime {} status {}', [
    taskEntity.id,
    taskEntity.endDate.toString(),
    taskEntity.reallocationTime.toString(),
    taskEntity.status,
  ])

  taskEntity.save()
}

export function handleTaskDeleted(event: TaskDeletedEvent): void {

  log.debug('TaskDeleted event received. taskId: {}', [
    event.params.taskId.toString(),
  ])

  store.remove('Task',event.params.taskId.toString())
}

export function handleTaskAllocated(event: TaskAllocatedEvent): void {

  log.debug('TaskAllocated event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  let taskEntity = Task.load(event.params.taskId.toString())
  if (taskEntity) {

    let taskAllocation = RoundRobinTAA.bind(event.address)
    let task = taskAllocation.getTask(event.params.taskId)
  
    taskEntity.endDate = task.value2
    taskEntity.status = STATUS_ASSIGNED,
    taskEntity.reallocationTime = task.value4

    let userEntity = Task.load(event.params.taskId.toString())
    if (userEntity) {
      taskEntity.assignee = userEntity.id
    }

    taskEntity.save()
  }
}

export function handleTaskAccepted(event: TaskAcceptedEvent): void {

  log.debug('TaskAccepted event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  let taskEntity = Task.load(event.params.taskId.toString())
  if (taskEntity) {
    // Assignee field is already set on task allocation event handler
    // (can't accept a task that wasnt assign to someone previously)
    // Nevertheless we set the field again just in case.
    taskEntity.assignee = event.params.userId.toString()
    taskEntity.status = STATUS_ACCEPTED
  
    taskEntity.save()
  }
}

export function handleTaskRejected(event: TaskRejectedEvent): void {
  log.debug('TaskAllocated event received. userId: {} taskId: {}', [
    event.params.userId.toString(),
    event.params.taskId.toString(),
  ])

  let taskEntity = Task.load(event.params.taskId.toString())
  if (taskEntity) {
    taskEntity.assignee = null
    taskEntity.status = STATUS_REJECTED
    taskEntity.rejecterUsers.push(event.params.userId.toString())
    taskEntity.save()  
  }

  let userEntity = User.load(event.params.userId.toString())
  if (userEntity) {
    userEntity.rejectedTasks.push(event.params.taskId.toString())
    userEntity.save()
  }
}

export function handleUserRegistered(event: UserRegisteredEvent): void {
  let useEntity = User.load(event.params.userId.toString())

  if (useEntity == null) {
    useEntity = new User(event.params.userId.toString())
  }

  useEntity.benefits = BigInt.fromI32(0)
  useEntity.available = true
  useEntity.rejectedTasks = []

  useEntity.save()

}

export function handleUserDeleted(event: UserDeletedEvent): void {

  log.debug('UserDeleted event received. userId: {}', [
    event.params.userId.toString(),
  ])

  store.remove('User', event.params.userId.toString())
}

export function handleRejecterDeleted(event: RejecterDeletedEvent): void {}

export function handleTasksRestart(event: TasksRestartEvent): void {}
