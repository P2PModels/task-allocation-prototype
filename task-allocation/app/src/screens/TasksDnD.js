import React, { useState, useCallback } from 'react'
import { useAragonApi } from '@aragon/api-react'
import styled from 'styled-components'
import { DndProvider } from 'react-dnd'
import Backend from 'react-dnd-html5-backend'

import {
  textStyle,
  useTheme,
  Box,
  GU,
  Modal,
  ToastHub,
  Toast,
  IconAttention,
} from '@aragon/ui'

import MetamaskLogo from '../../assets/MetamaskLogo.jpg'
import DraggableTasksSection from '../components/DraggableTasksSection'

import { getEditorLink } from '../lib/amara-utils'
import { utf8ToHex } from 'web3-utils'

const TasksDnD = ({
  tasks,
  videos,
  isLoading,
  availableSubRequestHandler = () => {},
  tasksLimit = 6,
  totalTasks = 0, 
  currentPage,
  onClickTranslateTask,
}) => {
  const theme = useTheme()
  const { api, appState } = useAragonApi()
  const { tasks: allocatedTasks, amara } = appState
  const {id: userId } = amara
  const [opened, setOpened] = useState(false)

  const formattedAllocatedTasks = allocatedTasks ? Object.keys(allocatedTasks).reduce(
    (totalTasks, key) => 
      totalTasks.concat(allocatedTasks[key]), [])
    : []
  const userAssignedTasks =
    tasks.length && allocatedTasks && allocatedTasks[userId]
      ? allocatedTasks[userId].reduce((assignedTasks, tId) => {
        const t = tasks.find(({ id }) => id.toString() === tId)
        if (t)
          assignedTasks.push(t)
        return assignedTasks
      }, [])
      : []
  const unassignedTasks =
    tasks && !!formattedAllocatedTasks
      ? tasks.filter(({ id }) =>
          !formattedAllocatedTasks.includes(id.toString())
        )
      : []

  const description = `These assignments are currently available for you. Drag the ones you want to the drop area.`
  const metamaskDescription = `You have to install Metamask in order to get assignments.`
  
  const handleTranslateTask = useCallback(task => {
    window.open(getEditorLink(task), '_blank')
    onClickTranslateTask()
  }, [])

  const handleAssignTask = useCallback(
    async ({ id, language }, toast) => {
      const languageCodeHex = utf8ToHex(language)
      console.log(
        `Assigning assignment ${id} which belongs to language group ${language} to the user ${userId}`
      )
      const userTaskId = await api
        .call('getUserTask', languageCodeHex, userId)
        .toPromise()
      userTaskId
        ? setOpened(true)
        : api.assignTask(languageCodeHex, userId, id.toString()).subscribe(
            ({ code }) => {
              if (code !== 4001)
                toast(
                  `You've got a new assignment. Check your dashboard!`
                )
            },
            err => console.log(err)
          )
    },
    [userId]
  )

  const close = useCallback(() => setOpened(false), [setOpened])

  return (
    <ToastHub position="left">
      <Toast>
        {toast => (
          <DndProvider backend={Backend}>
            <React.Fragment>
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
              <DraggableTasksSection
                tasks={userAssignedTasks}
                videos={videos}
                totalTasks={userAssignedTasks.length}
                barTitle="My Assignments"
                isLoading={isLoading}
                noTaskMessage="You don't have any assignment yet"
                tasksPerPage={tasksLimit}
                assignTaskHandler={handleTranslateTask}
                actionTaskButton={{label: 'Translate', mode: 'positive'}}
                isDropArea
              />
              <DraggableTasksSection
                tasks={unassignedTasks}
                videos={videos}
                totalTasks={totalTasks - formattedAllocatedTasks.length}
                barTitle="Available Assignments"
                isLoading={isLoading}
                noTaskMessage="There are no assignments pending for you"
                tasksPerPage={tasksLimit}
                assignTaskHandler={task => handleAssignTask(task, toast)}
                actionTaskButton={{label: 'Get Assignment', mode: 'strong'}}
                pageSelectedHandler={availableSubRequestHandler}
              />
              <Modal visible={opened} onClose={close}>
                <ModalContent>
                  <CustomIconAttention /> You already have an assignment
                  in that language.
                </ModalContent>
              </Modal>
            </React.Fragment>
          </DndProvider>
        )}
      </Toast>
    </ToastHub>
  )
}

const MetamaskBox = ({ description }) => {
  return (
    <Box
      css={`
        background-color: #506f8b;
        color: white;
      `}
      padding={5}
    >
      <MetamaskCard>
        <Icon>
          <img
            src={MetamaskLogo}
            css={{ width: '150px', paddingRight: `${3 * GU}px` }}
          />
        </Icon>
        <Description>{description}</Description>
        <Links>
          <ul>
            <li>
              <a href="https://metamask.io/" target="_blank">
                Install Metamask
              </a>
            </li>
            <li>
              <a
                href="https://blog.wetrust.io/how-to-install-and-use-metamask-7210720ca047"
                target="_blank"
              >
                How it works?
              </a>
            </li>
          </ul>
        </Links>
      </MetamaskCard>
    </Box>
  )
}

const MetamaskCard = styled.section`
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
  white-space: initial;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'icon description'
    'icon links';
  padding: ${2 * GU}px;
`

const Icon = styled.div`
  grid-area: icon;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`

const Description = styled.p`
  ${textStyle('body2')};
  color: inherit;
  text-align: left;
  grid-area: description;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  height: fit-content;
  margin-top: ${0.5 * GU}px;
`

const Links = styled.div`
  grid-area: links;
  margin-left: ${2 * GU}px;
`

const CustomSplit = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2%;
`

const NoTaskMessage = styled.span`
  color: grey;
  margin-left: 2%;
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

export default TasksDnD
