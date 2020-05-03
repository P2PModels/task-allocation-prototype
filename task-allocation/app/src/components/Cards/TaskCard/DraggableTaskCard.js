import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'
import { Box, Button } from '@aragon/ui'

import Thumbnail from './Thumbnail'
import Details from './Details'

import { USER_ID } from '../../../lib/amara-utils'
import { ItemTypes } from '../../../lib/dnd-utils'

const DraggableTaskCard = React.forwardRef(({ task, onActionClick, isAssigned }, _) => {
  const { video } = task

  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.TASK },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (_, monitor) => {
      monitor.didDrop() && onActionClick(USER_ID, task.id, task.language)
    },
  })

  return (
    <div 
      ref={isAssigned ? null : drag}
      css={`cursor: move; overflow: visible; opacity: ${isDragging ? 0.5 : 1};`}>
      <Box
        padding={20}
      >
        <TaskMain>
          <Thumbnail video={!!video && video} targetLanguage={task.language} />
          <Details task={task} />
          {isAssigned && (
            <Button
              css={`
                width: 100%;
                margin-top: 15px;
              `}
              onClick={() => onActionClick(USER_ID, task.id, task.language)}
              label="Translate"
              mode="positive"
            />
          )}
        </TaskMain>
      </Box>
    </div>
  )
})

const TaskMain = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`

export default DraggableTaskCard
