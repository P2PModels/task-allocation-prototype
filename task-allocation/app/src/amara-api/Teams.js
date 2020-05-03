import { instance } from './client/index'
import { createBasicCRUDEndpoints } from './api-helper'

const RESOURCE = 'teams'

const Teams = {
  ...createBasicCRUDEndpoints(RESOURCE),
  getTeamTasks: team => instance.get(`/${RESOURCE}/${team}/tasks`),
}

export default Teams
