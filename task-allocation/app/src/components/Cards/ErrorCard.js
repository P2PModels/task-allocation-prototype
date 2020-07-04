import React from 'react'

import { EmptyStateCard } from '@aragon/ui'

const ErrorCard = ({ msg }) => {
  return (
    <div>
      <EmptyStateCard text={<span>{msg}</span>} />
    </div>
  )
}

export default ErrorCard
