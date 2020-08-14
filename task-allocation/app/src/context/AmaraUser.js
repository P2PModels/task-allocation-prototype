import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { useAragonApi, usePath } from '@aragon/api-react'
import AmaraApi from '../amara-api'

const AmaraUserContext = createContext()

const initialState = {
  amaraUser: null,
  isLoading: false,
  errorMsg: '',
}

export function useAmaraUser() {
  const context = useContext(AmaraUserContext)

  if (!context) {
    throw new Error('useAmaraUser must be used within an AmaraUserProvider.')
  }

  return context
}

export function AmaraUserProvider(props) {
  const {
    appState: { apiUrl, isSyncing },
  } = useAragonApi()
  const [amaraUserState, setAmaraUserState] = useReducer(
    (prevState, state) => ({ ...prevState, ...state }),
    initialState
  )
  const { username } = props

  useEffect(() => {
    async function fetchAmaraAccount(username) {
      AmaraApi.setBaseUrl(apiUrl)
      setAmaraUserState({ isLoading: true })
      try {
        const { data: user } = await AmaraApi.users.getOne(username)
        if (user && Object.keys(user).length === 0) {
          setAmaraUserState({
            errorMsg: "Amara user account doesn't exist",
            isLoading: false,
          })
        }
        console.log('Amara user account fetched')
        AmaraApi.setApiKeyHeader(user.apiKey)
        setAmaraUserState({ amaraUser: user, isLoading: false })
      } catch (err) {
        setAmaraUserState({
          isLoading: false,
          errorMsg: 'There was a problem connecting to server',
        })
      }
    }
    if (username && !isSyncing) {
      fetchAmaraAccount(username)
    }
    return () => {}
  }, [username, isSyncing, apiUrl])

  return <AmaraUserContext.Provider value={amaraUserState} {...props} />
}
