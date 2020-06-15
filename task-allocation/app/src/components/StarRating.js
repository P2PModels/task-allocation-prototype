import React from 'react'
import styled from 'styled-components'
import StarIcon from 'mdi-react/StarIcon'
import StarOutlineIcon from 'mdi-react/StarOutlineIcon'

const StarRating = ({
  selectedRating,
  starCount,
  hoverRating,
  onClickStar,
  onHoverStar,
  onLeaveStar,
}) => {
  return (
    <RatingHolder>
      <RatingBar>
        {Array(starCount)
          .fill()
          .map((el, index) => {
            return (
              <RatingIcon
                key={index + 1}
                isRotating={selectedRating >= index + 1 || hoverRating >= index + 1}
                onClick={() => onClickStar(index + 1)}
                onMouseOver={() => onHoverStar(index + 1)}
                onMouseLeave={onLeaveStar}
              >
                {selectedRating >= index + 1 || hoverRating >= index + 1 ? (
                  <StarIcon />
                ) : (
                  <StarOutlineIcon />
                )}
              </RatingIcon>
            )
          })}
      </RatingBar>
    </RatingHolder>
  )
}

const RatingHolder = styled.div`
  display: flex;
  justify-content: center;
`

const RatingBar = styled.div`
  align-items: center;
  background-color: rgba(119, 119, 119, 0.1);
  border-radius: 5rem;
  display: flex;
  justify-content: center;
  margin: 0 0 2rem 0;
  width: 17rem;
`

const RatingIcon = styled.div`
  align-items: center;
  display: flex;
  color: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  justify-content: center;
  padding: 0;
  transition: all 0.5s ease-in-out;
  height: 3rem;
  width: 3rem;
  ${({ isRotating }) => isRotating && `transform: rotate(144deg);`}}
`


export default StarRating