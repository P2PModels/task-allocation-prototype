import { setApiKeyHeader, setBaseUrl } from './client'
import Teams from './Teams'
import Users from './Users'
import Videos from './Videos'

const Api = {
  teams: Teams,
  users: Users,
  videos: Videos,
  setApiKeyHeader,
  setBaseUrl,
}

export default Api
