import gql from 'graphql-tag'

export const CONFIG = (type: string) => gql`
  ${type} Config($id: String!) {
    config(id: $id) {
      id
      maxAllocatedTasks
    }
  }
`

export const USER_TASKS_BY_STATUS = (type: string) => gql`
  ${type} Tasks($appAddress: string!, $userId: ID!, $status: string!, $first: Int!, $skip: Int!) {
    tasks(where: {
      appAddress: $appAddress,
      status: $status,
      assignee: $userId
    }, first: $first, skip: $skip) {
      id
      endDate
      reallocationTime
    }
  } 
`

export const USER = (type: string) => gql`
  ${type} Users($id: String!) {
    users(where: {
      id: $id
    }) {
      id
      benefits
      available
    }
  }
`

export const USER_REJECTED_TASKS = (type: string) => gql`
  ${type} User($id: String!) {
    user(id: $id) {
      rejectedTasks {
        task {
          id
          endDate
          reallocationTime
          status
        }
      }
    }
  }
`
