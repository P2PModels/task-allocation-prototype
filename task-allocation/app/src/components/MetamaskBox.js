import React from 'react'
import styled from 'styled-components'

import { Box, textStyle, GU } from '@aragon/ui'
import MetamaskLogo from '../../assets/MetamaskLogo.jpg'

const MetamaskBox = ({ description }) => {
  const metamaskLink = 'https://metamask.io/'
  const metamaskInstallGuideLink =
    'https://blog.wetrust.io/how-to-install-and-use-metamask-7210720ca047'

  return (
    <Box
      css={`
        background-color: #506f8b;
        color: white;
      `}
      padding={5}
    >
      <MetamaskCard>
        <Icon>
          <img
            src={MetamaskLogo}
            css={{ width: '150px', paddingRight: `${3 * GU}px` }}
          />
        </Icon>
        <Description>{description}</Description>
        <Links>
          <ul>
            <li>
              <a href={metamaskLink} target="_blank" rel="noopener noreferrer">
                Install Metamask
              </a>
            </li>
            <li>
              <a
                href={metamaskInstallGuideLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                How it works?
              </a>
            </li>
          </ul>
        </Links>
      </MetamaskCard>
    </Box>
  )
}

const MetamaskCard = styled.section`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
  white-space: initial;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'icon description'
    'icon links';
  padding: ${2 * GU}px;
`

const Icon = styled.div`
  grid-area: icon;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const Description = styled.p`
  ${textStyle('body2')};
  color: inherit;
  text-align: left;
  grid-area: description;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  height: fit-content;
  margin-top: ${0.5 * GU}px;
`

const Links = styled.div`
  grid-area: links;
  margin-left: ${2 * GU}px;
`

export default MetamaskBox
