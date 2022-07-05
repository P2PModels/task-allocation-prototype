export const STATUS_NON_EXISTENT = 'NonExistent'
export const STATUS_AVAILABLE = 'Available'
export const STATUS_ACCEPTED = 'Accepted'
export const STATUS_COMPLETED = 'Completed'

export const STATUS_NON_EXISTENT_NUM = 0
export const STATUS_AVAILABLE_NUM = 1
export const STATUS_ACCEPTED_NUM = 2
export const STATUS_COMPLETED_NUM = 3

const statuses: string[] = [
  STATUS_NON_EXISTENT,
  STATUS_AVAILABLE,
  STATUS_ACCEPTED,
  STATUS_COMPLETED,
]

const intStatuses: i32[] = [0, 1, 2, 3]

export function getStatusByKey(statusKey: i32): string {
  return statuses[statusKey]
}

export function getIntStatusByKey(statusKey: i32): i32 {
  return intStatuses[statusKey]
}
