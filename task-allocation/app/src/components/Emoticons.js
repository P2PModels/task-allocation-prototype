import React from 'react'
import styled from 'styled-components'

const Emoticons = ({ selectedRating }) => {
  let expression
  switch (selectedRating) {
    case 1:
      expression = <Shock />
      break
    case 2:
      expression = <Sad />
      break
    case 3:
      expression = <Flat />
      break
    case 4:
      expression = <Smile />
      break
    case 5:
      expression = <Happy />
      break
    default:
      expression = <Smile />
  }

  return (
    <Face showFace={selectedRating > 0}>
      <Eye />
      <Mouth>{expression}</Mouth>
      <Eye />
    </Face>
  )
}

const Face = styled.div`
  display: flex;
  visibility: ${({ showFace }) => (showFace ? 'visible' : 'hidden')};
  height: 5rem;
  justify-content: center;
  padding: 20vh 0 20vh 0;
`

const Eye = styled.div`
  background-color: #333;
  border-radius: 50%;
  height: 1.5rem;
  width: 1.5rem;
`

const Mouth = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 1rem 0 1rem;
  width: 10rem;
`
const Shock = styled.div`
  background: #333;
  clip-path: circle(50px at 50% 100%);
  height: 4rem;
  margin-top: 1rem;
  transition: all 0.3s ease-in-out;
  width: 5rem;
`

const Sad = styled.div`
  border-color: #333 transparent transparent transparent;
  border-style: solid;
  border-width: 15px;
  border-radius: 100%;
  height: 4rem;
  margin-top: 2rem;
  transition: border-width 0.3s ease-in-out;
  width: 5rem;
`

const Flat = styled.div`
  border-bottom: solid 15px #333;
  margin-bottom: 1rem;
  height: 4rem;
  transition: all 0.3s ease-in-out;
  width: 3.5rem;
`

const Smile = styled.div`
  border-color: transparent transparent #333 transparent;
  border-style: solid;
  border-width: 15px;
  border-radius: 100%;
  height: 4rem;
  margin-top: -0.5rem;
  transition: border-width 0.3s ease-in-out;
  width: 5rem;
`

const Happy = styled.div`
  background: #333;
  clip-path: circle(50px at 50% 0);
  height: 4rem;
  margin-top: 2rem;
  transition: all 0.3s ease-in-out;
  width: 5rem;
`

export default Emoticons
