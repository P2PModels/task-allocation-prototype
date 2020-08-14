import React, { useState, useCallback, useEffect, useReducer } from 'react'
import { useAragonApi } from '@aragon/api-react'
import styled from 'styled-components'

import {
  textStyle,
  useTheme,
  Box,
  GU,
  Modal,
  FloatIndicator,
  LoadingRing,
  IconAttention,
} from '@aragon/ui'

import RRTasksSection from '../components/RRTasksSection'
import MetamaskBox from '../components/MetamaskBox'

import { useAmaraUser } from '../context/AmaraUser'
import { getEditorLink } from '../lib/amara-utils'
import { toHex } from 'web3-utils'
import AmaraApi from '../amara-api/'

// https://reactjs.org/docs/reconciliation.html

function initUserTasksState() {
  return {
    isLoading: false,
    availableTasks: [],
    acceptedTasks: [],
    videos: new Map(),
    currentPage: 0,
    tasksFetched: false,
  }
}

function arrayToMap(arr, idField) {
  return arr.reduce((registry, currElement) => {
    registry.set(currElement[idField], currElement)
    return registry
  }, new Map())
}

const RRTasks = ({
  availableSubRequestHandler = () => {},
  tasksLimit = 6,
  currentPage,
  onClickTranslateTask,
}) => {
  const theme = useTheme()
  const { api, appState } = useAragonApi()
  const { tasks: usersTasks, isSyncing } = appState
  const { amaraUser } = useAmaraUser()
  const [userTasksState, setUserTasksState] = useReducer(
    (prevState, state) => ({
      ...prevState,
      ...state,
    }),
    initUserTasksState()
  )
  const [opened, setOpened] = useState(false)

  const description = `These assignments are currently available for you during a particular period of time.`
  const metamaskDescription = `You have to install Metamask in order to start getting assignments.`
  const userId = amaraUser && amaraUser.id ? amaraUser.id : ''
  const username = amaraUser && amaraUser.username ? amaraUser.username : ''
  const { availableTasks, acceptedTasks } =
    usersTasks && usersTasks[username]
      ? usersTasks[username]
      : { availableTasks: [], acceptedTasks: [] }

  useEffect(() => {
    const { teams } = amaraUser
    async function fetchUserTasks(tasks) {
      return await Promise.all(
        tasks.map(async t => {
          const {
            data: fetchedTask,
          } = await AmaraApi.teams.getTeamSubtitleRequest(teams[0].name, t.id)

          return {
            ...fetchedTask,
            ...t,
          }
        })
      )
    }
    const fetchAllUserTasks = async () => {
      setUserTasksState({ isLoading: true })
      const t0 = performance.now()
      const apiCallPromises = []
      if (!userTasksState.videos.length) apiCallPromises.push(getVideos())
      apiCallPromises.push(
        fetchUserTasks(availableTasks),
        fetchUserTasks(acceptedTasks)
      )
      const [
        videosRes,
        availableTasksRes,
        acceptedTasksRes,
      ] = await Promise.all(apiCallPromises)
      const t1 = performance.now()
      console.log(`Get tasks execution time: ${(t1 - t0) / 1000}`)
      setUserTasksState({
        isLoading: false,
        videos: videosRes,
        availableTasks: availableTasksRes,
        acceptedTasks: acceptedTasksRes,
        tasksFetched: true,
      })
    }

    if (!isSyncing && (availableTasks.length || acceptedTasks.length)) {
      console.log('[RRTasks] useEffect: fetching tasks... ')
      fetchAllUserTasks()
    }

    return () => {}
  }, [isSyncing, availableTasks.length, acceptedTasks.length])

  const getVideos = async () => {
    const { teams } = amaraUser
    const t0 = performance.now()
    const {
      data: { objects: teamVideos },
    } = await AmaraApi.videos.getAll({ team: teams[0].name })
    const t1 = performance.now()
    console.log(`Get videos execution time: ${(t1 - t0) / 1000}`)
    return arrayToMap(teamVideos, 'id')
  }

  const handleTranslateTask = useCallback(task => {
    window.open(getEditorLink(task), '_blank')
    onClickTranslateTask()
  }, [])

  const handleAcceptTask = useCallback(
    async task => {
      const { id, language, team } = task
      console.log(
        `Accept assignment ${id} which belongs to language group ${language} to the user ${username}`
      )
      api
        .acceptTask(toHex(username), toHex(id.toString()))
        .toPromise()
        .then(
          res => {
            /* We'll get the transaction receipt when the user confirms the
              transaction and a error code otherwise. */
            if (res && !res.code) {
              // AmaraApi.setBaseUrl(apiUrl)
              AmaraApi.teams.updateSubtitleRequest(team, id, username).then(
                () => {
                  const anchorEl = document.getElementById('anchor')
                  anchorEl.scrollIntoView({ behavior: 'smooth' })
                  showToast(
                    "You've accept a new assignment. You will soon see your task on your dashboard. It might take a minute"
                  )
                },
                err => console.error(err)
              )
            }
          },
          err => console.error(err)
        )
    },
    [userId]
  )

  const handleDeclineTask = async task => {
    const { id, language } = task
    console.log(
      `User ${username} decline assignment ${id} which belongs to language group ${language}`
    )
    api
      .rejectTask(toHex(username), toHex(id.toString()))
      .toPromise()
      .then(res => {
        showToast("You've deline the assignment")
      })
  }

  const close = useCallback(() => setOpened(false), [setOpened])

  const showToast = msg => {
    const toastEl = document.getElementById('custom-toast')
    toastEl.innerText = msg
    toastEl.style.visibility = 'visible'
    setTimeout(() => {
      toastEl.style.visibility = 'hidden'
      toastEl.innerText = ''
    }, 9000)
  }

  return (
    <div
      css={`
        margin-bottom: 50px;
      `}
    >
      <CustomSplit>
        <Box
          css={`
            width: 90%;
            margin-right: 2%;
          `}
          padding={3 * GU}
          heading={
            <div
              css={`
                ${textStyle('body3')};
              `}
            >
              Description
            </div>
          }
        >
          {description}
        </Box>
        <MetamaskBox theme={theme} description={metamaskDescription} />
      </CustomSplit>
      <div id="anchor" />
      <RRTasksSection
        tasks={userTasksState.acceptedTasks}
        videos={userTasksState.videos}
        totalTasks={userTasksState.acceptedTasks.length}
        barTitle="My Assignments"
        isLoading={userTasksState.isLoading}
        noTaskMessage="You don't have any assignment yet"
        tasksPerPage={tasksLimit}
        actionTaskButtons={[
          {
            label: 'Translate',
            mode: 'strong',
            actionHandler: handleTranslateTask,
          },
        ]}
      />
      <RRTasksSection
        tasks={userTasksState.availableTasks}
        videos={userTasksState.videos}
        totalTasks={userTasksState.availableTasks.length}
        barTitle="Available Assignments"
        isLoading={userTasksState.isLoading}
        noTaskMessage="There are no assignments pending for you"
        tasksPerPage={tasksLimit}
        currentPage={currentPage}
        actionTaskButtons={[
          {
            label: 'Accept',
            mode: 'positive',
            actionHandler: handleAcceptTask,
          },
          {
            label: 'Decline',
            mode: 'negative',
            actionHandler: handleDeclineTask,
          },
        ]}
        pageSelectedHandler={availableSubRequestHandler}
      />
      {/* Aragon toast component can't be called after a transaction
      is signed because the Aragon Client hides the screen component so we can't
      change its state.
        This is a workaround to that problem */}
      <FloatIndicator css="visibility: hidden;" id="custom-toast" shift={50}>
        #
      </FloatIndicator>
      {userTasksState.isLoading && (
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
          <CustomIconAttention /> You already have an assignment in that
          language.
        </ModalContent>
      </Modal>
    </div>
  )
}

const CustomSplit = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2%;
`

const ModalContent = styled.div`
  display: flex;
  align-items: center;
`

const CustomIconAttention = styled(IconAttention)`
  width: 70px;
  height: 70px;
  margin-right: 1.5%;
`
export default RRTasks
