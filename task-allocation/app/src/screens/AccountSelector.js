import React, { useState, useEffect, useCallback } from 'react'
import { useAragonApi } from '@aragon/api-react'
import PropTypes from 'prop-types'

import {
  DropDown,
  EmptyStateCard,
  GU,
  LoadingRing,
  useTheme,
  textStyle,
} from '@aragon/ui'

import AmaraApi from '../amara-api'

const AccountSelector = React.memo(({ onSelectAccount }) => {
  const { appState } = useAragonApi()
  const { apiUrl } = appState
  const [isSyncing, setIsSyncing] = useState(true)
  const [error, setError] = useState("")
  const [accounts, setAccounts] = useState([])
  const formattedAccounts = accounts.map(({ username }) => username)
  const theme = useTheme()

  const handleSelectedUser = useCallback(
    async selectedIndex => {
      try {
        const selectedUser = accounts[selectedIndex]
        AmaraApi.setApiKeyHeader(selectedUser.apiKey)
        const { data: teams } = await AmaraApi.users.getUserTeams(
          selectedUser.username
        )
        onSelectAccount({ ...selectedUser, teams })
      } catch (err) {
        console.error(err)
        setError("Couldn't access user")
      }
    },
    [onSelectAccount, accounts]
  )

  useEffect(() => {
    if(apiUrl) {
      setError('')
      AmaraApi.setBaseUrl(apiUrl)
      AmaraApi.users.getDemoUsers().then(
        ({ data }) => {
          setIsSyncing(false)
          setAccounts(data)
        },
        err => {
          setIsSyncing(false)
          setError("Couldn't load demo user accounts")
          console.error(`Couldn't load user demo accounts`, err)
        }
      )
    }
  }, [apiUrl])

  return (
    <div>
      <EmptyStateCard
        text={
          isSyncing ? (
            <div
              css={`
                display: grid;
                align-items: center;
                justify-content: center;
                grid-template-columns: auto auto;
                grid-gap: ${1 * GU}px;
              `}
            >
              <LoadingRing />
              <span
                css={`
                  color: ${theme.contentSecondary};
                  ${textStyle('body2')}
                `}
              >
                Fetching accounts...
              </span>
            </div>
          ) : (
          <span>{error ? 
            error
            : formattedAccounts.length ? 'Select a demo account' 
            : 'There are no demo accounts available at the moment'}
          </span>
          )
        }
        action={
          !isSyncing && !!formattedAccounts.length && (
            <DropDown
              items={formattedAccounts}
              selected={-1}
              onChange={handleSelectedUser}
              placeholder="Select account"
            />
          )
        }
      />
    </div>
  )
})

AccountSelector.propTypes = {
  onSelectAccount: PropTypes.func.isRequired,
}

export default AccountSelector
