import React, { useState, useRef, useMemo } from 'react'
import styled from 'styled-components'

import { Bar, Pagination, textStyle } from '@aragon/ui'

import TaskCardGroup from './Cards/TaskCardGroup'
import RRTaskCard from './Cards/TaskCard/RRTaskCard'

const RRTasksSection = ({
  barTitle,
  tasks = [],
  videos,
  isLoading,
  noTaskMessage,
  tasksPerPage = 3,
  currentPage = 0,
  totalTasks = 0,
  pageSelectedHandler = () => {},
  actionTaskButtons = [] /* { label, mode, actionHandler} */,
}) => {
  const [selectedPage, setSelectedPage] = useState(0)
  const anchorRef = useRef(null)

  const pageTasks = useMemo(() => {
    const init = selectedPage * tasksPerPage
    const end = init + tasksPerPage
    return tasks.slice(init, end)
  }, [selectedPage, tasksPerPage, tasks])

  const handleSelectedPage = page => {
    anchorRef.current.scrollIntoView()
    setSelectedPage(page)
    pageSelectedHandler(tasksPerPage, tasksPerPage * page)
  }
  const numberPages = totalTasks >= 0 ? Math.ceil(totalTasks / tasksPerPage) : 0

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
      <div>
        {pageTasks && pageTasks.length > 0 && (
          <TaskCardGroup>
            {pageTasks.map((t, index) => (
              <RRTaskCard
                margin={index === 0}
                key={t.id}
                task={t}
                video={videos.get(t.video)}
                actionTaskButtons={actionTaskButtons}
              />
            ))}
          </TaskCardGroup>
        )}
        {tasks && tasks.length === 0 && !isLoading && (
          <NoTaskMessage>
            {noTaskMessage || 'There are no tasks.'}
          </NoTaskMessage>
        )}
      </div>
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

export default RRTasksSection
