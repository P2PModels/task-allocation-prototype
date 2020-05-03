import { instance } from './client'

function createBasicCRUDEndpoints(name) {
  const endpoints = {}

  endpoints.getOne = (id, query) => instance.get(`/${name}/${id}`)

  endpoints.update = (id, modifiedEntity) =>
    instance.post(`/${name}/${id}`, modifiedEntity)

  return endpoints
}

export { createBasicCRUDEndpoints }
