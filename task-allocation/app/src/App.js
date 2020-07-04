import React, {
  useEffect,
  useState,
  useCallback,
  useReducer,
  useMemo,
} from 'react'
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
import AdminDashboard from './components/AdminDashboard'
import ErrorCard from './components/Cards/ErrorCard'

import { ADMIN_ADDRESS } from './lib/amara-utils'

import { toChecksumAddress } from 'web3-utils'

const modes = [
  { name: 'normal', body: 'Tasks' },
  { name: 'drag&drop', body: 'TasksDnD' },
]

const TASK_LIMIT = 9
const TASKDND_LIMIT = 3

function parsePath(path) {
  const mockPath = '/normal/p2pmodels.user65'
  const parseSegments = mockPath.split('/').filter(value => value.length)
  if (parseSegments.length) {
    switch (parseSegments[0]) {
      case 'normal':
        parseSegments[0] = 0
        break
      case 'drag&drop':
        parseSegments[0] = 1
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

function App() {
  const { api, appState, connectedAccount } = useAragonApi()
  const [path] = usePath()
  const { amara, apiUrl, isSyncing } = appState
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
  const [requestError, setRequestError] = useState('')
  const [userIsLoading, setUserIsLoading] = useState(false)
  const [userFound, setUserFound] = useState(false)
  const amaraId = amara ? amara.id : undefined
  const [mode, pathUsername] = useMemo(() => parsePath(path), [path])

  const ScreenTab = ({ screenName }) => {
    switch (screenName.toLowerCase()) {
      case 'tasks':
        return (
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
      case 'tasksdnd':
        return (
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
    }
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
    api.emitTrigger('AccountDisconnected', {})
    // setShowFeedback(false)
  }

  const handleDisconnectAccount = useCallback(() => {
    amara.id &&
      AmaraApi.users.update(amara.id, { ...amara, active: 0 }).then(
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
  // Fetch user account
  useEffect(() => {
    async function getUserAccount(username) {
      try {
        setUserIsLoading(true)
        AmaraApi.setBaseUrl(apiUrl)
        const { data: user } = await AmaraApi.users.getOne(username)
        if (user && Object.keys(user).length === 0)
          throw new Error("Amara account doesn't exist")
        api.emitTrigger('AccountSelected', { amara: user })
        setUserIsLoading(false)
        setUserFound(true)
      } catch (err) {
        setRequestError(err.message || 'Problem trying to get amara user')
        console.error(err)
        setUserIsLoading(false)
      }
    }
    if (!isSyncing && pathUsername && apiUrl) getUserAccount(pathUsername)
  }, [pathUsername, apiUrl, isSyncing])

  // Fetch sub requests
  useEffect(() => {
    setSubRequestsState(initSubRequestsState())
    if (userFound && amara && amara.id && apiUrl) {
      const { teams, username, languages } = amara
      AmaraApi.setApiKeyHeader(amara.apiKey)
      AmaraApi.setBaseUrl(apiUrl)

      // eslint-disable-next-line no-inner-declarations
      async function getSubRequestsData() {
        try {
          const t0 = performance.now()
          setSubRequestsState({ isLoading: true })
          const {
            data: { objects: teamSubRequests },
          } = await AmaraApi.teams.getAvailableTeamSubtitleRequests(
            teams[0].name,
            { username, limit: 100 }
          )
          const {
            data: { objects: teamVideos },
          } = await AmaraApi.videos.getAll({ team: teams[0].name })
          const languageFilteredSubRequests = teamSubRequests.filter(
            ({ language }) =>
              languages.find(
                ({ code }) => code.toLowerCase() === language.toLowerCase()
              )
          )
          const t1 = performance.now()
          console.log(`Execution time: ${(t1 - t0) / 1000}`)
          setSubRequestsState({
            isLoading: false,
            subRequests: formatSubRequests(languageFilteredSubRequests),
            totalSubRequests: languageFilteredSubRequests.length,
            videos: formatVideos(teamVideos),
          })
        } catch (err) {
          console.error(err)
          setSubRequestsState({
            isLoading: false,
          })
        }
      }

      getSubRequestsData()
    }
  }, [userFound, apiUrl, amaraId])

  return (
    <>
      {showFeedback ? (
        <Feedback onClickSubmit={handleFeedbackSubmit} />
      ) : (
        <Main>
          {!requestError && mode > -1 && userFound && amaraId ? (
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
              <ScreenTab screenName={modes[mode].body} />
            </>
          ) : (
            !isSyncing &&
            (requestError || mode === -1 || !apiUrl) && (
              <ErrorCardLayout>
                <ErrorCard
                  msg={
                    mode === -1
                      ? 'Invalid URL'
                      : !apiUrl
                      ? "Couldn't connect to server"
                      : requestError
                  }
                />
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
          {mode > -1 && subRequestsState.isLoading && (
            <FloatIndicator shift={50}>
              <LoadingRing />
              <span
                css={`
                  margin-left: 5%;
                `}
              >
                Fetching assignments...
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

export default App
