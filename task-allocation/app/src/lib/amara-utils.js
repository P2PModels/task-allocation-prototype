export const USER_API = 'c68ac9f6a6cf18c84bb6a36853b24474fc309b2c'
// export const USER_API = 'd6dfe8b06704020e3280559e55905e0e9a24d735'
export const USER_ID = 'm3IX-EV9exE-vTRxhtPQ2xvAmLEaJahy8rREk7y9QEQ'
export const USERNAME = 'paulo_colombo'
export const USER_SUSBSCRIBED_GROUPS = [
  'ability',
  'captions-requested',
  'github',
  'globalvoices',
]

export const ADMIN_ADDRESS = '0x27E9727FD9b8CdDdd0854F56712AD9DF647FaB74'
// export const ADMIN_ADDRESS = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'

export function getEditorLink(task) {
  return `https://amara.org/es/subtitles/editor/${task['video_id']}/${task.language}/#create-form`
}
