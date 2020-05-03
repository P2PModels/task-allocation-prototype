import React from 'react'
import styled from 'styled-components'

import { GU, textStyle } from '@aragon/ui'

const Tag = ({ label, background, color, uppercase }) => {
  return (
    <MainTag uppercase={uppercase} background={background} color={color}>
      <p
        css={`
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
          ${textStyle('body3')}
        `}
      >
        {label}
      </p>
    </MainTag>
  )
}

const MainTag = styled.div`
  border-radius: ${2.5 * GU}px;
  padding: 0 10px;
  background-color: ${({ background }) => background};
  color: ${({ color }) => color};
  ${({ uppercase }) => (uppercase ? 'text-transform: uppercase' : '')};
  opacity: 0.8;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
`
export default Tag
