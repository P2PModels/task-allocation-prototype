import { instance } from './client/index'
import { createBasicCRUDEndpoints } from './api-helper'
import Teams from './Teams'
import Videos from './Videos'

const RESOURCE = 'users'

const Users = {
  ...createBasicCRUDEndpoints(RESOURCE),

  getDemoUsers: () => instance.get(`/${RESOURCE}/default`),

  getUserTeams: username => 
    instance.get(`/${RESOURCE}/${username}/teams`),

  getUserAvailableTasks: async (id, teams) => {
    const teamTasks = (
      await Promise.all(teams.map(({ name }) => Teams.getTeamTasks(name)))
    )
      .map(({ data }) => data.objects)
      .filter(tasks => tasks.length > 0)
    
    // Filter available tasks
    const availableTasks = []
    teamTasks.forEach(tasks =>
      availableTasks.push(
        ...tasks.filter(
          task => !task.assignee || task.assignee === null || task.assignee.id === id
        )
      )
    )

    // Get task videos
    const fullAvailableTasks = (
      await Promise.all(availableTasks.map(t => Videos.getOne(t['video_id'])))
    ).map(({ data }, index) => {
      return { ...availableTasks[index], video: data }
    })

    return fullAvailableTasks
  },
}

export default Users
