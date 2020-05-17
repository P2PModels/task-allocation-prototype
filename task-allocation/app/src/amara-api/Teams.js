import { instance } from './client/index'
import { createBasicCRUDEndpoints, flatQueryParams, AVAILALBLE_SUBTITLE_REQUESTS_QUERY } from './api-helper'

const RESOURCE = 'teams'

const Teams = {
  ...createBasicCRUDEndpoints(RESOURCE),
  getTeamTasks: team => instance.get(`/${RESOURCE}/${team}/tasks`),
  getAvailableTeamSubtitleRequests: (team, queryParams) => {
    const path = `/${RESOURCE}/${team}/subtitle-requests/${flatQueryParams({...AVAILALBLE_SUBTITLE_REQUESTS_QUERY, ...queryParams})}`
    return instance.get(path)
  }
}

export default Teams
