import { instance } from './client/index'
import { createBasicCRUDEndpoints } from './api-helper'

const RESOURCE = 'users'

const Users = {
  ...createBasicCRUDEndpoints(RESOURCE),

  getDemoUsers: () => instance.get(`/${RESOURCE}/default`),

  getUserTeams: username => instance.get(`/${RESOURCE}/${username}/teams`),
}

export default Users
