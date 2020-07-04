import React, { useState } from 'react'
import styled from 'styled-components'
import { TextInput, textStyle, Box, Button } from '@aragon/ui'

const AdminDashboard = ({ onClickChangeBaseUrl, onClickRestart }) => {
  const [baseUrl, setBaseUrl] = useState('')

  const handleBaseUrlChange = ({ target: { value } }) => setBaseUrl(value)
  const handleBaseUrlClick = () => {
    onClickChangeBaseUrl(baseUrl)
    setBaseUrl('')
  }

  return (
    <>
      <Box
        css={`
          display: flexbox;
          flex-direction: column;
        `}
      >
        <BoxLayout>
          <div
            css={`
              margin-bottom: 3%;
            `}
          >
            <span
              css={`
                ${textStyle('body2')}
              `}
            >
              API proxy base url:{' '}
            </span>
            <TextInput
              placeholder="Base URL"
              value={baseUrl}
              onChange={handleBaseUrlChange}
            />
            <Button
              label="Change"
              mode="positive"
              onClick={handleBaseUrlClick}
            />
          </div>
          <Button
            label="Restart task allocation"
            mode="negative"
            onClick={onClickRestart}
          />
        </BoxLayout>
      </Box>
    </>
  )
}

const BoxLayout = styled.div`
  display: flex;
  flex-direction: column;
`
export default AdminDashboard
