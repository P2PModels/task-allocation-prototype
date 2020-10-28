export const STATUS_NON_EXISTENT = 'NonExistent'
export const STATUS_AVAILABLE = 'Available'
export const STATUS_ASSIGNED = 'Assigned'
export const STATUS_ACCEPTED = 'Accepted'
export const STATUS_REJECTED = 'Rejected'
export const STATUS_COMPLETED = 'Completed'

const statuses: string[] = [
    STATUS_NON_EXISTENT,
    STATUS_AVAILABLE,
    STATUS_ASSIGNED,
    STATUS_ACCEPTED,
    STATUS_REJECTED,
    STATUS_COMPLETED
]

export function getStatusByKey(statusKey: i32): string {
    return statuses[statusKey]
}
