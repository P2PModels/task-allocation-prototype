import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import {
  Config as ConfigEntity,
  Task as TaskEntity,
  User as UserEntity,
  UserRejectedTask as UserRejectedTaskEntity,
} from '../generated/schema'
import { RoundRobinApp as RoundRobinContract } from '../generated/templates/RoundRobinApp/RoundRobinApp'
import { getStatusByKey, STATUS_AVAILABLE } from './task-statuses'

// Entity Id Builders

function getConfigEntityId(appAddress: Address): string {
  return appAddress.toHexString()
}

function getUserRejectedTaskEntityId(userId: string, taskId: string): string {
  return 'userId:' + userId + '-' + 'taskId:' + taskId
}

function getTaskEntityId(appAddress: Address, taskId: Bytes): string {
  return (
    'appAddress:' +
    appAddress.toHexString() +
    '-' +
    'taskId:' +
    taskId.toHexString()
  )
}

function getUserEntityId(appAddress: Address, userId: Bytes): string {
  return (
    'appAddress:' +
    appAddress.toHexString() +
    '-' +
    'userId:' +
    userId.toHexString()
  )
}

// Contract Getters

// Need taskId because task.id has a different format (<appAddress>-<taskId>)
export function populateTaskDataFromContract(
  appAddress: Address,
  task: TaskEntity | null,
  taskContractId: Bytes
): void {
  const taskAllocation = RoundRobinContract.bind(appAddress)
  const taskData = taskAllocation.getTask(taskContractId)
  // return {
  //     endDate: taskData.value2,
  //     statusKey: taskData.value3,
  //     reallocationTime: taskData.value4,
  // }
  task.endDate = taskData.value2
  task.status = getStatusByKey(taskData.value3)
  task.reallocationTime = taskData.value4
}

export function getOrgAddress(appAddress: Address): Address {
  const taskAllocation = RoundRobinContract.bind(appAddress)
  return taskAllocation.kernel()
}

// TheGraph Entities Getters

export function getConfigEntity(appAddress: Address): ConfigEntity | null {
  const configEntityId = getConfigEntityId(appAddress)
  let config = ConfigEntity.load(configEntityId)

  if (!config) {
    config = new ConfigEntity(configEntityId)
    config.maxAllocatedTasks = 0
    config.appAddress = appAddress
    config.orgAddress = getOrgAddress(appAddress)
  }

  return config
}

export function getTaskEntity(
  appAddress: Address,
  taskId: Bytes
): TaskEntity | null {
  const taskEntityId = getTaskEntityId(appAddress, taskId)
  let task = TaskEntity.load(taskEntityId)

  if (!task) {
    task = new TaskEntity(taskEntityId)
    populateTaskDataFromContract(appAddress, task, taskId)

    task.endDate = BigInt.fromI32(0)
    task.status = STATUS_AVAILABLE
    task.appAddress = appAddress
    task.orgAddress = getOrgAddress(appAddress)
  }

  return task
}

export function getUserEntity(
  appAddress: Address,
  userId: Bytes
): UserEntity | null {
  const userEntityId = getUserEntityId(appAddress, userId)
  let user = UserEntity.load(userEntityId)

  if (!user) {
    user = new UserEntity(userEntityId)
    user.benefits = BigInt.fromI32(0)
    user.available = true
    user.appAddress = appAddress
    user.orgAddress = getOrgAddress(appAddress)
  }

  return user
}

export function getUserRejectedTaskEntity(
  appAddress: Address,
  userId: Bytes,
  taskId: Bytes
): UserRejectedTaskEntity | null {
  const user = getUserEntity(appAddress, userId)
  const task = getTaskEntity(appAddress, taskId)
  const userTaskId = getUserRejectedTaskEntityId(user.id, task.id)
  let userRejectedTask = UserRejectedTaskEntity.load(userTaskId)

  if (!userRejectedTask) {
    userRejectedTask = new UserRejectedTaskEntity(userTaskId)
    userRejectedTask.user = user.id
    userRejectedTask.task = task.id
  }

  return userRejectedTask
}

// Others

export function loadAppConfig(appAddress: Address): void {
  const config = getConfigEntity(appAddress)
  const taskAllocation = RoundRobinContract.bind(appAddress)

  config.maxAllocatedTasks = taskAllocation.MAX_ALLOCATED_TASKS()

  config.save()
}

/* export function populateConfigDataFromContract(config: ConfigEntity, appAddress: Address): void {
    const taskAllocation = RoundRobinContract.bind(appAddress)
    const configData = taskAllocation.
} */
