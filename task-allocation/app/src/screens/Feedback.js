import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Button } from '@aragon/ui'

import StarRating from '../components/StarRating'
import Emoticons from '../components/Emoticons'

const Feedback = ({ onClickSubmit }) => {
  const [hoverRating, setHoverRating] = useState(3)
  const [selectedRating, setSelectedRating] = useState(3)
  let background = "";
  switch (selectedRating) {
    case 0: 
      background = ''
      break;
    case 1:
      background = "linear-gradient(0deg, #ef6c00, #e65100)";
      break;
    case 2:
      background = "linear-gradient(0deg, #f57f17, #ef6c00)";
      break;
    case 3:
      background = "linear-gradient(0deg, #f9a825, #f57f17)";
      break;
    case 4:
      background = "linear-gradient(0deg, #fbc02d, #f9a825)";
      break;
    case 5:
      background = "linear-gradient(0deg, #fdd835, #fbc02d)";
      break;
    default:
      background = "linear-gradient(0deg, #fbc02d, #f9a825)";
  }

  const handleStarClick = useCallback(i => {
    setSelectedRating(i)
  }, [setSelectedRating])

  const handleStarHover = useCallback(i => {
    setHoverRating(i)
  }, [setHoverRating])

  const handleStarLeave = useCallback(() => {
    setHoverRating(0)
  }, [setHoverRating])

  return (
    <OuterWrapper>
      <InnerWrapper background={background}>
        <Emoticons selectedRating={selectedRating} />
        <Label>Rate your experience</Label>
        <StarRating
          starCount={5}
          hoverRating={hoverRating}
          selectedRating={selectedRating}
          onClickStar={handleStarClick}
          onHoverStar={handleStarHover}
          onLeaveStar={handleStarLeave}
        />
        <CustomButton label="Submit" onClick={onClickSubmit} />
      </InnerWrapper>
    </OuterWrapper>
  )
}

const CustomButton = styled(Button)`
  width: 30px;
`
const OuterWrapper = styled.div`
  color: #333;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1.3em;
  margin: 0;
  text-align: center;
`

const InnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease-in-out;
  width: 100vw;
  background-image: ${({ background }) => background};
`

const Label = styled.div`
  font-size: 1.2rem;  
  font-weight: 700;
  margin: 1.5rem 0;
`

export default Feedback