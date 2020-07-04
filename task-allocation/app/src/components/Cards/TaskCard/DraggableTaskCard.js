import React from 'react'
import styled from 'styled-components'
import { useDrag } from 'react-dnd'
import { Box, Button } from '@aragon/ui'

import Thumbnail from './Thumbnail'
import Details from './Details'

import { ItemTypes } from '../../../lib/dnd-utils'

const DraggableTaskCard = React.forwardRef(
  ({ task, video, onActionClick, isAssigned, action: { label, mode } }, _) => {
    let actionLabel = label
    if (mode === 'positive') {
      if (task.language === video.primary_audio_language_code)
        actionLabel = 'Transcribe'
      else actionLabel = 'Translate'
    }
    const [{ isDragging }, drag] = useDrag({
      item: { type: ItemTypes.TASK },
      collect: monitor => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (_, monitor) => {
        monitor.didDrop() && onActionClick(task.id, task.language)
      },
    })

    return (
      <div
        ref={isAssigned ? null : drag}
        css={`
          cursor: pointer;
          overflow: visible;
          opacity: ${isDragging ? 0.5 : 1};
        `}
      >
        <Box padding={20}>
          <TaskMain>
            <Thumbnail
              video={!!video && video}
              targetLanguage={task.language}
            />
            <Details task={task} video={video} />
            {isAssigned && (
              <Button
                css={`
                  width: 100%;
                  margin-top: 15px;
                `}
                onClick={() => onActionClick(task.id, task.language)}
                label={actionLabel}
                mode="positive"
              />
            )}
          </TaskMain>
        </Box>
      </div>
    )
  }
)

const TaskMain = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`

export default DraggableTaskCard
