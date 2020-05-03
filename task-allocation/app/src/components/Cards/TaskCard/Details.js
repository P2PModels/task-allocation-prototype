import React from 'react'
import styled from 'styled-components'
import { useTheme, textStyle } from '@aragon/ui'

import languageCodes from '../../../lib/language-codes'

const Details = ({ task }) => {
  const { video } = task
  const subLanguages = video.languages
    .filter(({ published }) => published)
    .map(({ name }) => name.replace(',', ' -'))
  const formattedSubLanguages = `${subLanguages
    .slice(0, -1)
    .join(', ')} and ${subLanguages.slice(-1)}`
  return (
    <DetailsMain>
      <DetailsTitle textStyle={textStyle('body3')}>Details</DetailsTitle>
      <div
        css={`
          ${textStyle('body3')}
        `}
      >
        <Detail name="Team" value={video && video.team} />
        <Detail name="Source Team" value={video && video.team} />
        <Detail name="Video" value={video && video.title} />
        <Detail
          name="Video Language"
          value={video && languageCodes[video.primary_audio_language_code]}
        />
        <Detail name="Subtitle language" value={formattedSubLanguages} />
        <Detail name="Guidelines" />
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
