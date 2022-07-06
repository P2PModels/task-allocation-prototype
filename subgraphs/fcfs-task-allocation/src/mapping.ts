import { store, log } from '@graphprotocol/graph-ts'
import {
  ApiUrlSet,
  TaskAccepted,
  TaskCreated,
  TaskDeleted,
  TasksRestart,
  UserDeleted,
  UserRegistered
} from "../generated/FCFSTAA/FCFSTAA"
import {
  STATUS_AVAILABLE,
  STATUS_ACCEPTED,
} from './task-statuses'
import { Task, User } from "../generated/schema"

export function handleUserRegistered(event: UserRegistered): void {
  let entity = User.load(event.params.userId.toString())

  if (entity == null) {
    entity = new User(event.params.userId.toString())
  }

  entity.hasTask = false

  entity.save()
}

export function handleTaskCreated(event: TaskCreated): void {
  let entity = Task.load(event.params.taskId.toString())

  if (entity == null) {
    entity = new Task(event.params.taskId.toString())
  }

  entity.userId = '0'
  entity.status = STATUS_AVAILABLE

  entity.save()
}

export function handleTaskAccepted(event: TaskAccepted): void {
  let taskEntity = Task.load(event.params.taskId.toString())

  if(taskEntity){
    taskEntity.userId = event.params.userId.toString()
    taskEntity.status = STATUS_ACCEPTED
    taskEntity.save()
  }

  let userEntity = User.load(event.params.userId.toString())

  if(userEntity){
    userEntity.hasTask = true
    userEntity.save()
  }

}

export function handleTaskDeleted(event: TaskDeleted): void {
  store.remove('Task', event.params.taskId.toString())
}

export function handleUserDeleted(event: UserDeleted): void {
  store.remove('User', event.params.userId.toString())
}

export function handleTasksRestart(event: TasksRestart): void {}
export function handleApiUrlSet(event: ApiUrlSet): void {}

