import { instance } from './client'

function flatQueryParams(queryParams) {
  if (queryParams)
    return Object.keys(queryParams).reduce((prevQueries, queryKey, index) => {
      return `${prevQueries}${index > 0 ? '&' : ''}${queryKey}=${
        queryParams[queryKey]
      }`
    }, '?')
  return ''
}

function createBasicCRUDEndpoints(name) {
  const endpoints = {}

  endpoints.getAll = query => {
    const formattedQuery = flatQueryParams(query)
    return instance.get(`/${name}${formattedQuery}`)
  }

  endpoints.getOne = (id, query) => {
    const formattedQuery = flatQueryParams(query)
    return instance.get(`/${name}/${id}${formattedQuery}`)
  }

  endpoints.update = (id, modifiedEntity) =>
    instance.post(`/${name}/${id}`, modifiedEntity)

  endpoints.create = entity => instance.post(`/${name}`, entity)

  return endpoints
}

const AVAILALBLE_SUBTITLE_REQUESTS_QUERY = { work_status: 'needs-subtitler' }
export {
  createBasicCRUDEndpoints,
  flatQueryParams,
  AVAILALBLE_SUBTITLE_REQUESTS_QUERY,
}
