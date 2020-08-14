import React from 'react'
import styled from 'styled-components'

import { Box, Button, Timer } from '@aragon/ui'

import Thumbnail from './Thumbnail'
import Details from './Details'

const RRTaskCard = ({
  task,
  video,
  margin,
  actionTaskButtons = [] /* { label, mode, actionHandler} */,
}) => {
  if (
    actionTaskButtons.length === 1 &&
    actionTaskButtons[0].label.toLowerCase() === 'translate' &&
    task.language === video.primary_audio_language_code
  ) {
    actionTaskButtons[0].label = 'Transcribe'
  }
  return (
    <Box
      padding={20}
      css={`
        ${margin ? 'margin-top: 16px;' : ''}
      `}
    >
      <TaskMain>
        {task.endDate && <Timer end={task.endDate} />}
        <Thumbnail video={!!video && video} targetLanguage={task.language} />
        <Details task={task} video={video} />
        <TaskButtons>
          {actionTaskButtons.map(({ label, mode, actionHandler }) => {
            return (
              <Button
                key={label}
                css={`
                  margin-top: 15px;
                  ${actionTaskButtons.length === 1 ? 'width: 100%;' : ''}
                `}
                onClick={() => actionHandler(task)}
                label={label}
                mode={mode}
              />
            )
          })}
        </TaskButtons>
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

const TaskButtons = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
`

export default RRTaskCard
