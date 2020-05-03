import React from 'react'

import { CardLayout, GU, useLayout } from '@aragon/ui'

const TaskCardGroup = ({ children, columnWidth = 34 * GU }) => {
  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'
  const rowHeight = compactMode ? null : 530

  return (
    <section>
      <CardLayout columnWidthMin={columnWidth} rowHeight={rowHeight}>
        {children}
      </CardLayout>
    </section>
  )
}

export default TaskCardGroup
