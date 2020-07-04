import { createBasicCRUDEndpoints } from './api-helper'

const RESOURCE = 'ratings'

const Ratings = {
  ...createBasicCRUDEndpoints(RESOURCE),
}

export default Ratings
