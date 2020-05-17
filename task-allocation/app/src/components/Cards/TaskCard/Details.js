import React from 'react'
import styled from 'styled-components'
import moment from 'moment'
import { useTheme, textStyle } from '@aragon/ui'

import languageCodes from '../../../lib/language-codes'

const Details = ({ task, video }) => {
  const subLanguages = video.languages
    .filter(({ published }) => published)
    .map(({ name }) => name.replace(',', ' -'))
  const formattedSubLanguages = subLanguages && subLanguages.length === 0 ?
    `No subtitles published` :
    subLanguages.length === 1 ? 
      `${subLanguages[0]}` :
      `${subLanguages
        .slice(0, -1)
        .join(', ')} and ${subLanguages.slice(-1)}`
  const dueDate = moment(task.due_date).isValid() ? 
  `${moment(task.due_date).format('YYYY-MM-DD HH:mm')} 
    (${moment().to(task.due_date)})` : `No due date`

  return (
    <DetailsMain>
      <DetailsTitle textStyle={textStyle('body3')}>Details</DetailsTitle>
      <div
        css={`
          ${textStyle('body3')}
        `}
      >
        <Detail name="Team" value={video && video.team} />
        <Detail name="Source team" value={video && video.team} />
        <Detail name="Video" value={video && video.title} />
        <Detail
          name="Video language"
          value={video && languageCodes[video.primary_audio_language_code]}
        />
        <Detail name="Subtitle language" value={formattedSubLanguages} />
        {/* <Detail name="Guidelines" /> */}
        <Detail name="Request due date" value={dueDate} />
      </div>
    </DetailsMain>
  )
}

const Detail = ({ name, value }) => {
  const theme = useTheme()
  return (
    <div>
      <strong>{name}: </strong>
      <span
        css={`
          color: ${theme.surfaceContentSecondary};
        `}
      >
        {value || 'Unknown'}
      </span>
    </div>
  )
}

const DetailsMain = styled.div`
  display: flex;
  flex-direction: column;
`

const DetailsTitle = styled.div`
  ${({ textStyle }) => textStyle}
  text-transform: uppercase;
`

export default Details
