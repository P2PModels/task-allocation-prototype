import { setApiKeyHeader, setBaseUrl } from './client'
import Teams from './Teams'
import Users from './Users'
import Videos from './Videos'
import Ratings from './Ratings'

const Api = {
  teams: Teams,
  users: Users,
  videos: Videos,
  ratings: Ratings,
  setApiKeyHeader,
  setBaseUrl,
}

export default Api
