export const ADMIN_ADDRESS = '0x27E9727FD9b8CdDdd0854F56712AD9DF647FaB74'
// export const ADMIN_ADDRESS = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7'

export function getEditorLink(task) {
  return `https://staging.amara.org/en/subtitles/editor/${task['video']}/${task.language}/?team=${task.team}`
}
