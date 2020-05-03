import React from 'react'
import styled from 'styled-components'

import { Box, Button } from '@aragon/ui'

import Thumbnail from './Thumbnail'
import Details from './Details'

const TaskCard = ({ task, onActionClick, margin, action: { label, mode }}) => {
  const { video } = task

  return (
    <Box
      padding={20}
      css={`
        ${margin ? 'margin-top: 16px;' : ''}
      `}
    >
      <TaskMain>
        <Thumbnail video={!!video && video} targetLanguage={task.language} />
        <Details task={task} />
        <Button
          css={`
            width: 100%;
            margin-top: 15px;
          `}
          onClick={() => onActionClick(task.id, task.language)}
          label={label}
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
