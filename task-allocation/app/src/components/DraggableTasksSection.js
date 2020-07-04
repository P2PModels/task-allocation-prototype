import React, { useState, useRef, useMemo } from 'react'
import styled from 'styled-components'

import { textStyle, Bar, Pagination } from '@aragon/ui'

import DropArea from '../components/DropArea'
import DraggableTaskCard from '../components/Cards/TaskCard/DraggableTaskCard'
import TaskCardGroup from '../components/Cards/TaskCardGroup'

const DraggableTasksSection = ({
  barTitle,
  tasks = [],
  videos,
  isLoading,
  noTaskMessage,
  tasksPerPage = 3,
  currentPage = 0,
  totalTasks = 0,
  assignTaskHandler,
  pageSelectedHandler = () => {},
  actionTaskButton,
  isDropArea = false,
}) => {
  const [selectedPage, setSelectedPage] = useState(0)
  const anchorRef = useRef(null)

  const pageTasks = useMemo(() => {
    const init = selectedPage * tasksPerPage
    const end = init + tasksPerPage
    return tasks.slice(init, end)
  }, [selectedPage, tasksPerPage, tasks])

  const numberPages = totalTasks >= 0 ? Math.ceil(totalTasks / tasksPerPage) : 0

  const handleSelectedPage = page => {
    // anchorRef.current.scrollIntoView()
    setSelectedPage(page)
    pageSelectedHandler(tasksPerPage, tasksPerPage * page)
  }

  const Tasks = () => (
    <div>
      {pageTasks && pageTasks.length > 0 && (
        <TaskCardGroup>
          {pageTasks.map((t, index) => (
            <DraggableTaskCard
              margin={index === 0}
              key={t.id}
              task={t}
              video={videos.get(t.video)}
              onActionClick={() => assignTaskHandler(t)}
              action={actionTaskButton}
              isAssigned={isDropArea}
            />
          ))}
        </TaskCardGroup>
      )}
      {tasks && tasks.length === 0 && !isLoading && (
        <NoTaskMessage>{noTaskMessage || 'There are no tasks.'}</NoTaskMessage>
      )}
    </div>
  )

  return (
    <div>
      <div ref={anchorRef} />
      <Bar
        primary={
          <span
            css={`
              ${textStyle('title4')}
            `}
          >
            {`${barTitle || 'Tasks'} `}
            {totalTasks > 0 && <span>({totalTasks})</span>}
          </span>
        }
      />
      {isDropArea ? (
        <DropArea isEmpty={tasks.length === 0}>
          <Tasks />
        </DropArea>
      ) : (
        <Tasks />
      )}
      <Pagination
        pages={numberPages}
        selected={selectedPage}
        onChange={handleSelectedPage}
      />
    </div>
  )
}

const NoTaskMessage = styled.div`
  color: grey;
  margin-left: 2%;
  margin-bottom: 5%;
`

export default DraggableTasksSection
