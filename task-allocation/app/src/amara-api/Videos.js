import { createBasicCRUDEndpoints } from './api-helper'

const RESOURCE = 'videos'

const Videos = {
  ...createBasicCRUDEndpoints(RESOURCE),
}

export default Videos
