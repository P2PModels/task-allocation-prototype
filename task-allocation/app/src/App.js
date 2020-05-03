import React, { useEffect, useState, useCallback } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Header, textStyle, Button, FloatIndicator, LoadingRing, Tabs } from '@aragon/ui'
import styled from 'styled-components'

import Tasks from './screens/Tasks'
import TasksDnD from './screens/TasksDnD'

import AccountSelector from './screens/AccountSelector'

import AmaraApi from './amara-api/'
import AdminDashboard from './components/AdminDashboard'
import { ADMIN_ADDRESS } from './lib/amara-utils'

import { toChecksumAddress } from 'web3-utils'

const tabs = [{name: 'Tasks', body: 'Tasks'}, {name:'Tasks Drag & Drop', body: 'TasksDnD'}]

function App() {
  const { api, appState, connectedAccount } = useAragonApi()
  const { amara, apiUrl, isSyncing } = appState
  const [availableTasks, setAvailableTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const amaraId = amara ? amara.id : undefined

  const ScreenTab = ({ screenName }) => {
    switch(screenName.toLowerCase()) {
      case 'tasks':
        return (
          <Tasks
            tasks={availableTasks}
            isLoading={isLoading}
            userId={amara.id}
          />
        )
      case 'tasksdnd':
        return (
          <TasksDnD
            tasks={availableTasks}
            isLoading={isLoading}
            userId={amara.id}
          />
        )
    }
  }

  const handleSelectedAccount = useCallback(amara => {
    try {
      AmaraApi.users.update(amara.id, { ...amara, active: 1 })
      api.emitTrigger('AccountSelected', { amara })
    } catch (err) {
      console.error(err)
    }
  }, [api])

  const handleDisconnectAccount = useCallback(() => {
    amara.id && AmaraApi.users.update(amara.id, { ...amara, active: 0 }).then(
      () => 
        api.emitTrigger('AccountDisconnected', {}),
      err => {
        setAvailableTasks([])
        console.error('Error trying to disconnect account', err)
      }
    )
  }, [amaraId, api])

  const handleRestartClick = () => {
    api.restart().subscribe(
      () => console.log('Prototype restarted'),
      err => console.error(err)
    )
  }

  useEffect(() => {
    setAvailableTasks([])
    if (amara && amara.id && apiUrl) {
      const { id, teams } = amara
      AmaraApi.setApiKeyHeader(amara.apiKey)
      AmaraApi.setBaseUrl(apiUrl)
      setIsLoading(true)
      AmaraApi.users.getUserAvailableTasks(id, teams).then(
        tasks => {
          setIsLoading(false)
          setAvailableTasks(tasks)
        },
        err =>{
          setIsLoading(false)
          console.error('Error trying to get user available tasks', err)
        }
      )
    }
  }, [amaraId, apiUrl])

  return (
    <Main>
      {isSyncing && <Syncing />}
      {amaraId ? (
        <React.Fragment>
          <div css={`margin-top: 4%;`}>
            <Tabs
              items={tabs.map(t => t.name)}
              selected={selected}
              onChange={setSelected}
            />
          </div>
          <Header
            primary={
              <HeaderLayout>
              <div
                css={`
                  ${textStyle('title2')}
                `}
              >
                Task Allocation
              </div>
              <Button label="Disconnect" mode="negative" onClick={handleDisconnectAccount} />
              </HeaderLayout>
            }
          />
          <ScreenTab screenName={tabs[selected].body} />
        </React.Fragment>
      ) : (
        <AccountSelectorLayout>
          <AccountSelector onSelectAccount={handleSelectedAccount} />
        </AccountSelectorLayout>
      )}
      {isLoading && (
        <FloatIndicator>
          <LoadingRing />
          Fetching available tasks
        </FloatIndicator>
      )}
      {connectedAccount && toChecksumAddress(connectedAccount) === toChecksumAddress(ADMIN_ADDRESS) && 
            <AdminDashboardLayout>
              <AdminDashboard onClickChangeBaseUrl={baseUrl => api.setApiUrl(baseUrl).toPromise()} onClickRestart={handleRestartClick} />
            </AdminDashboardLayout>}
    </Main>
  )
}

const AdminDashboardLayout = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10%;
`
const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

const HeaderLayout = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`
const AccountSelectorLayout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
export default App
