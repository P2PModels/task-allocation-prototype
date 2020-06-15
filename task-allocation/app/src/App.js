import React, { useEffect, useState, useCallback, useReducer } from 'react'
import { useAragonApi } from '@aragon/api-react'
import { 
  Main,
  Header,
  textStyle,
  Button,
  FloatIndicator,
  LoadingRing,
  Tabs,
  Modal,
  IconError
} from '@aragon/ui'
import styled from 'styled-components'

import Tasks from './screens/Tasks'
import TasksDnD from './screens/TasksDnD'
import AccountSelector from './screens/AccountSelector'
import Feedback from './screens/Feedback'

import AmaraApi from './amara-api/'
import AdminDashboard from './components/AdminDashboard'
import { ADMIN_ADDRESS } from './lib/amara-utils'

import { toChecksumAddress } from 'web3-utils'

const tabs = [{name: 'Assignments', body: 'Tasks'}, {name:'Assignments Drag & Drop', body: 'TasksDnD'}]

const TASK_LIMIT = 9
const TASKDND_LIMIT = 3 

function formatSubRequests(subRequests) {
  return subRequests.map(subRequest => {
    subRequest.id = subRequest.job_id
    return subRequest
  })
}

function formatVideos(videos) {
  return videos.reduce((videosRegistry, currVideo) => {
    videosRegistry.set(currVideo.id, currVideo)
    return videosRegistry
  }, new Map())
}

function initSubRequestsState() {
  return {
    isLoading: false,
    subRequests: [],
    videos: new Map(),
    totalSubRequests: 0,
    currentPage: 0,
  }
}

function App() {
  const { api, appState, connectedAccount } = useAragonApi()
  const { amara, apiUrl, isSyncing } = appState
  const [subRequestsState, setSubRequestsState] = useReducer(
    (subRequestsState, newSubRequestsState) => 
      ({...subRequestsState, ...newSubRequestsState}),
    initSubRequestsState()
  )
  const [selected, setSelected] = useState(0)
  const [opened, setOpened] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const amaraId = amara ? amara.id : undefined

  const ScreenTab = ({ screenName }) => {
    switch(screenName.toLowerCase()) {
      case 'tasks':
        return (
          <Tasks
            tasks={subRequestsState.subRequests}
            videos={subRequestsState.videos}
            totalTasks={subRequestsState.totalSubRequests}
            currentPage={subRequestsState.currentPage}
            tasksLimit={TASK_LIMIT} 
            isLoading={subRequestsState.isLoading}
            userId={amara.id}
            onClickTranslateTask={handleDisconnectAccount}
          />
        )
      case 'tasksdnd':
        return (
          <TasksDnD
            tasks={subRequestsState.subRequests}
            videos={subRequestsState.videos}
            totalTasks={subRequestsState.totalSubRequests}
            currentPage={subRequestsState.currentPage}
            tasksLimit={TASKDND_LIMIT}
            isLoading={subRequestsState.isLoading}
            userId={amara.id}
            onClickTranslateTask={handleDisconnectAccount}
          />
        )
    }
  }

  const handleFeedbackSubmit = () => {
    console.log('Sending feedback data to server...')
    setShowFeedback(false)
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
      () => {
        api.emitTrigger('AccountDisconnected', {})
        setShowFeedback(true)
      },
      err => {
        setSubRequestsState(initSubRequestsState())
        connectionErrorHandler('Error trying to disconnect account')
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

  const close = useCallback(() => setOpened(false), [setOpened])

  const connectionErrorHandler = useCallback(mes => {
    setModalMessage(mes)
    setOpened(true)
  }, [setModalMessage, setOpened])

  // const handleAvailableSubRequestPagination = (limit, offset) => {
  //   const { teams } = amara
  //   setSubRequestsState({ isLoading: true })
  //   AmaraApi.teams.getAvailableTeamSubtitleRequests(teams[0].name , { limit, offset }).then(
  //     ({data: { objects: subRequests }}) => {
  //       setSubRequestsState({
  //         isLoading: false,
  //         subRequests: formatSubRequests(subRequests),
  //         currentPage: Math.floor(offset / limit)
  //       })
  //     },
  //     err => {
  //       setSubRequestsState({ isLoading: false })
  //       console.error('Error trying to get user subtitle requests', err)
  //     }
  //   )
  // }

  // Fetch sub requests
  useEffect(() => {
    setSubRequestsState(initSubRequestsState())
    if (amara && amara.id && apiUrl) {
      const { teams, username } = amara
      AmaraApi.setApiKeyHeader(amara.apiKey)
      AmaraApi.setBaseUrl(apiUrl)

      async function getSubRequestsData() {
        const t0 = performance.now()
        setSubRequestsState({isLoading: true})
        const { data: { objects: teamSubRequests, meta: { total_count }}} = 
          await AmaraApi.teams.getAvailableTeamSubtitleRequests(teams[0].name, { username, limit: 100 })

        const { data: { objects: teamVideos }} = await AmaraApi.videos.getAll({ team: teams[0].name })
        const t1 = performance.now()
        console.log(`Execution time: ${(t1- t0) / 1000}`)
        setSubRequestsState({
          isLoading: false,
          subRequests: formatSubRequests(teamSubRequests),
          totalSubRequests: total_count,
          videos: formatVideos(teamVideos),
        })
      }

      getSubRequestsData()
    }
  }, [amaraId, apiUrl])

  return (
    <React.Fragment>
      {showFeedback ? (
        <Feedback onClickSubmit={handleFeedbackSubmit} />
      ) : (
        <Main>
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
                    Assignment Allocation
                  </div>
                  </HeaderLayout>
                }
              />
              <ScreenTab screenName={tabs[selected].body} />
            </React.Fragment>
          ) : (
            <AccountSelectorLayout>
              <AccountSelector
                onSelectAccount={handleSelectedAccount}
              />
            </AccountSelectorLayout>
          )}
          {subRequestsState.isLoading && (
            <FloatIndicator shift={window.innerWidth - 224}>
              <LoadingRing />
              <span css={`margin-left: 5%;`}>Fetching assignments...</span>
            </FloatIndicator>
          )}
          <Modal visible={opened} onClose={close}>
            <ModalContent>
              <CustomIconError /> {modalMessage}
            </ModalContent>
          </Modal>
          {connectedAccount && toChecksumAddress(connectedAccount) === toChecksumAddress(ADMIN_ADDRESS) && 
            <AdminDashboardLayout>
              <AdminDashboard onClickChangeBaseUrl={baseUrl => api.setApiUrl(baseUrl).toPromise()} onClickRestart={handleRestartClick} />
            </AdminDashboardLayout>
          }
        </Main>
      )}
    </React.Fragment>
  )
}

const AdminDashboardLayout = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10%;
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
const ModalContent = styled.div`
  display: flex;
  align-items: center;
`

const CustomIconError = styled(IconError)`
  width: 70px;
  height: 70px;
  margin-right: 1.5%;
`

export default App
