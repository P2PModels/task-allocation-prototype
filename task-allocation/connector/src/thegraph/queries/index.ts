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
  ${type} Tasks($statuses: [Int]!, $userId: ID!, $first: Int!, $skip: Int!) {
    tasks(where: {
      statusInt_in: $statuses,
      assignee: $userId
    }, first: $first, skip: $skip) {
      id
      endDate
      reallocationTime
      status
      assignee {
        id
      }
    }
  } 
`

export const USER = (type: string) => gql`
  ${type} User($id: String!) {
    user(id: $id) {
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
