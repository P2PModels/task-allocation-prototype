import React, { useState, useCallback, useReducer, useMemo } from 'react'
import { useAragonApi, usePath } from '@aragon/api-react'
import {
  Main,
  Header,
  textStyle,
  FloatIndicator,
  LoadingRing,
  Modal,
  IconError,
} from '@aragon/ui'

import styled from 'styled-components'
import moment from 'moment'

import Tasks from './screens/Tasks'
import TasksDnD from './screens/TasksDnD'
import Feedback from './screens/Feedback'

import AmaraApi from './amara-api/'
import { AmaraUserProvider, useAmaraUser } from './context/AmaraUser'
import AdminDashboard from './components/AdminDashboard'
import ErrorCard from './components/Cards/ErrorCard'

import { ADMIN_ADDRESS } from './lib/amara-utils'

import { toChecksumAddress } from 'web3-utils'
import RRTasks from './screens/RRTasks'

const modes = [
  { name: 'normal', body: 'Tasks' },
  { name: 'drag&drop', body: 'TasksDnD' },
  { name: 'round-robin', body: 'RRTasks' },
]

const TASK_LIMIT = 9
const TASKDND_LIMIT = 3

function parsePath(path) {
  const mockPath = '/round-robin/p2pmodels.user1'
  const parseSegments = mockPath.split('/').filter(value => value.length)
  if (parseSegments.length) {
    switch (parseSegments[0]) {
      case 'normal':
        parseSegments[0] = 0
        break
      case 'drag&drop':
        parseSegments[0] = 1
        break
      case 'round-robin':
        parseSegments[0] = 2
        break
      default:
        parseSegments[0] = 0
    }
  } else parseSegments.push(-1, '')
  return parseSegments
}

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

const AppWrapper = () => {
  const [path] = usePath()
  const [mode, pathUsername] = useMemo(() => parsePath(path), [path])
  return (
    <AmaraUserProvider username={pathUsername}>
      <App mode={mode} />
    </AmaraUserProvider>
  )
}

function App({ mode }) {
  const { api, appState, connectedAccount } = useAragonApi()
  const { apiUrl, isSyncing } = appState
  const {
    amaraUser,
    isLoading: userIsLoading,
    errorMsg: userErrorMsg,
  } = useAmaraUser()
  const [subRequestsState, setSubRequestsState] = useReducer(
    (subRequestsState, newSubRequestsState) => ({
      ...subRequestsState,
      ...newSubRequestsState,
    }),
    initSubRequestsState()
  )
  const [opened, setOpened] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)

  const amaraId = amaraUser ? amaraUser.id : undefined
  let taskAllocationComponent

  const handleDisconnectAccount = useCallback(() => {
    amaraId &&
      AmaraApi.users.update(amaraId, { ...amaraUser, active: 0 }).then(
        () => {
          setShowFeedback(true)
        },
        err => {
          setSubRequestsState(initSubRequestsState())
          connectionErrorHandler('Error trying to disconnect account')
          console.error('Error trying to disconnect account', err)
        }
      )
  }, [amaraId, api])
  switch (modes[mode].name.toLowerCase()) {
    case 'tasks':
      taskAllocationComponent = (
        <Tasks
          tasks={subRequestsState.subRequests}
          videos={subRequestsState.videos}
          totalTasks={subRequestsState.totalSubRequests}
          currentPage={subRequestsState.currentPage}
          tasksLimit={TASK_LIMIT}
          isLoading={subRequestsState.isLoading}
          onClickTranslateTask={handleDisconnectAccount}
        />
      )
      break
    case 'tasksdnd':
      taskAllocationComponent = (
        <TasksDnD
          tasks={subRequestsState.subRequests}
          videos={subRequestsState.videos}
          totalTasks={subRequestsState.totalSubRequests}
          currentPage={subRequestsState.currentPage}
          tasksLimit={TASKDND_LIMIT}
          isLoading={subRequestsState.isLoading}
          onClickTranslateTask={handleDisconnectAccount}
        />
      )
      break
    case 'round-robin':
      taskAllocationComponent = (
        <RRTasks
          currentPage={subRequestsState.currentPage}
          tasksLimit={TASKDND_LIMIT}
          onClickTranslateTask={handleDisconnectAccount}
        />
      )
      break
  }

  const handleFeedbackSubmit = selectedRating => {
    AmaraApi.setBaseUrl(apiUrl)
    AmaraApi.ratings
      .create({
        userId: amaraId,
        date: moment().toString(),
        score: selectedRating,
      })
      .then(
        () => {
          console.log('feedback stored')
        },
        err => {
          console.error(err)
        }
      )
    // api.emitTrigger('AccountDisconnected', {})
    // setShowFeedback(false)
  }

  const handleRestartClick = () => {
    api.restart().subscribe(
      () => console.log('Prototype restarted'),
      err => console.error(err)
    )
  }

  const close = useCallback(() => setOpened(false), [setOpened])

  const connectionErrorHandler = useCallback(
    mes => {
      setModalMessage(mes)
      setOpened(true)
    },
    [setModalMessage, setOpened]
  )

  // Fetch sub requests
  // useEffect(() => {
  //   setSubRequestsState(initSubRequestsState())
  //   if (userFound && amara && amara.id && apiUrl) {
  //     const { teams, username, languages } = amara
  //     AmaraApi.setApiKeyHeader(amara.apiKey)
  //     AmaraApi.setBaseUrl(apiUrl)

  //     // eslint-disable-next-line no-inner-declarations
  //     async function getSubRequestsData() {
  //       try {
  //         const t0 = performance.now()
  //         setSubRequestsState({ isLoading: true })
  //         const {
  //           data: { objects: teamSubRequests },
  //         } = await AmaraApi.teams.getAvailableTeamSubtitleRequests(
  //           teams[0].name,
  //           { username, limit: 100 }
  //         )
  //         const {
  //           data: { objects: teamVideos },
  //         } = await AmaraApi.videos.getAll({ team: teams[0].name })
  //         const languageFilteredSubRequests = teamSubRequests.filter(
  //           ({ language }) =>
  //             languages.find(
  //               ({ code }) => code.toLowerCase() === language.toLowerCase()
  //             )
  //         )
  //         const t1 = performance.now()
  //         console.log(`Execution time: ${(t1 - t0) / 1000}`)
  //         setSubRequestsState({
  //           isLoading: false,
  //           subRequests: formatSubRequests(languageFilteredSubRequests),
  //           totalSubRequests: languageFilteredSubRequests.length,
  //           videos: formatVideos(teamVideos),
  //         })
  //       } catch (err) {
  //         console.error(err)
  //         setSubRequestsState({
  //           isLoading: false,
  //         })
  //       }
  //     }

  //     getSubRequestsData()
  //   }
  // }, [userFound, apiUrl, amaraId, mode])
  console.log('[App] rendering')
  return (
    <>
      {showFeedback ? (
        <Feedback onClickSubmit={handleFeedbackSubmit} />
      ) : (
        <Main>
          {mode > -1 && amaraUser && !userErrorMsg ? (
            <>
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
              {taskAllocationComponent}
            </>
          ) : (
            !isSyncing &&
            (userErrorMsg || mode === -1) && (
              <ErrorCardLayout>
                <ErrorCard msg={mode === -1 ? 'Invalid URL' : userErrorMsg} />
              </ErrorCardLayout>
            )
          )}
          {mode > -1 && userIsLoading && (
            <FloatIndicator shift={50}>
              <LoadingRing />
              <span
                css={`
                  margin-left: 5%;
                `}
              >
                Fetching user...
              </span>
            </FloatIndicator>
          )}
          <Modal visible={opened} onClose={close}>
            <ModalContent>
              <CustomIconError /> {modalMessage}
            </ModalContent>
          </Modal>
          {connectedAccount &&
            toChecksumAddress(connectedAccount) ===
              toChecksumAddress(ADMIN_ADDRESS) && (
              <AdminDashboardLayout>
                <AdminDashboard
                  onClickChangeBaseUrl={baseUrl =>
                    api.setApiUrl(baseUrl).toPromise()
                  }
                  onClickRestart={handleRestartClick}
                />
              </AdminDashboardLayout>
            )}
        </Main>
      )}
    </>
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
const ModalContent = styled.div`
  display: flex;
  align-items: center;
`

const CustomIconError = styled(IconError)`
  width: 70px;
  height: 70px;
  margin-right: 1.5%;
`

const ErrorCardLayout = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export default AppWrapper
