import React from 'react'
import styled from 'styled-components'

import NoThumbnail from '../../../../assets/NoThumbnail.jpg'
import languageCodes from '../../../lib/language-codes'

import Tag from '../../Shared/Tag'

const Thumbnail = ({ video, targetLanguage, onClickHandler }) => {
  const { thumbnail, duration, title } = video
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div
      css={`
        max-width: 100%;
      `}
      onClick={onClickHandler}
    >
      <TagLine pos={'23px'}>
        {targetLanguage && (
          <VideoTag
            uppercase
            background="black"
            color="white"
            label={
              languageCodes[targetLanguage]
                ? languageCodes[targetLanguage]
                : 'Unknown'
            }
          />
        )}
        {duration && (
          <VideoTag
            uppercase
            background="black"
            color="white"
            label={
              <span>
                {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
              </span>
            }
          />
        )}
      </TagLine>
      <div>
        <img
          css={`
            width: 100%;
          `}
          src={thumbnail || NoThumbnail}
        />
        <a href={video.all_urls[0]} target="_blank">
          <PlayButtonIcon>
            <ArrowRight />
          </PlayButtonIcon>
        </a>
        {title && (
          <TagLine paintLine pos={'-29px'}>
            <VideoTag
              uppercase={false}
              size="normal"
              background="black"
              color="white"
              noOpacity
              label={title}
            />
          </TagLine>
        )}
      </div>
    </div>
  )
}

const PlayButtonIcon = styled.div`
  position: absolute;
  top: 20%;
  left: 45%;
  transition: transform 0.5s;
  width: 20%;
  &:hover {
    transform: scale(1.1);
  }
`

const TagLine = styled.div`
  position: relative;
  display: inline-block;
  top: ${({ pos }) => pos};
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  ${({ paintLine }) => (paintLine ? 'background: black; opacity: 0.6;' : null)}
`
const VideoTag = styled(Tag)`
  position: relative;
  top: ${({ topPos }) => topPos}px;
  left: ${({ leftPos }) => leftPos}px;
`

const ArrowRight = styled.div`
  width: 0;
  height: 0;
  border-top: 30px solid transparent;
  border-bottom: 30px solid transparent;
  border-left: 45px solid rgb(51, 204, 255);
`

export default Thumbnail
