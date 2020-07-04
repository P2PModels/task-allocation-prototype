import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useDrop } from 'react-dnd'

import { IconArrowDown } from '@aragon/ui'

import { ItemTypes } from '../lib/dnd-utils'

const INITIAL_HEIGHT = '370px'

const DropArea = React.forwardRef(({ children, isEmpty }, _) => {
  const [{ canDrop }, drop] = useDrop({
    accept: ItemTypes.TASK,
    collect: monitor => ({
      canDrop: !!monitor.canDrop(),
    }),
  })
  return (
    <WrapperDropArea ref={drop}>
      <MainDropArea canDrop={canDrop} isEmpty={isEmpty}>
        {isEmpty && canDrop ? null : children}
      </MainDropArea>
      {canDrop && (
        <DropPreviewArea>
          <FloatingArrowDown size="large" color="black" />
          <span
            css={`
              font-weight: bold;
            `}
          >
            Drop your task here
          </span>
        </DropPreviewArea>
      )}
    </WrapperDropArea>
  )
})

const float = keyframes`
  0% {
    transform: translatey(0px);
  }
  50% {
    transform: translatey(-15px);
  }
  100% {
    transform: translatey(0px);
  }
`

const WrapperDropArea = styled.div`
  position: relative;
`

const MainDropArea = styled.div`
  ${({ isEmpty }) =>
    isEmpty ? `height: ${INITIAL_HEIGHT};` : `transition: opacity 0.5s;`}

  ${({ canDrop }) => canDrop && `opacity: 0.2;`}
  margin-bottom: 1%;
`

const DropPreviewArea = styled.div`
  position: absolute;
  top: 0;
  border: 2px dashed grey;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const FloatingArrowDown = styled(IconArrowDown)`
  height: 50px;
  width: 50px;
  z-index: 999;
  animation: ${float} 2.5s ease-in-out infinite;
`
export default DropArea
