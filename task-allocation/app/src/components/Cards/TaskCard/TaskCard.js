import React from 'react'
import styled from 'styled-components'

import { Box, Button } from '@aragon/ui'

import Thumbnail from './Thumbnail'
import Details from './Details'

const TaskCard = ({ task, video, onActionClick, margin, action: { label, mode }}) => {
  let actionLabel = label
  if (mode === 'positive') {
    if (task.language === video.primary_audio_language_code)
      actionLabel = 'Transcribe'
    else
      actionLabel = 'Translate'
  }

  return (
    <Box
      padding={20}
      css={`
        ${margin ? 'margin-top: 16px;' : ''}
      `}
    >
      <TaskMain>
        <Thumbnail video={!!video && video} targetLanguage={task.language} />
        <Details task={task} video={video} />
        <Button
          css={`
            width: 100%;
            margin-top: 15px;
          `}
          onClick={() => onActionClick(task.id, task.language)}
          label={actionLabel}
          mode={mode}
        />
      </TaskMain>
    </Box>
  )
}

const TaskMain = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`

export default TaskCard
