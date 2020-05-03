import React, { useState, useRef } from 'react'
import styled from 'styled-components'

import {
  textStyle,
  Bar,
  Pagination,
} from '@aragon/ui'

import DropArea from '../components/DropArea'
import DraggableTaskCard from '../components/Cards/TaskCard/DraggableTaskCard'
import TaskCardGroup from '../components/Cards/TaskCardGroup'

const DraggableTasksSection = ({
  barTitle,
  tasks = [],
  isLoading,
  noTaskMessage,
  tasksPerPage = 3,
  assignTaskHandler,
  actionTaskButton, 
  isDropArea = false,
}) => {
  const [selectedPage, setSelectedPage] = useState(0)
  const [selectedTasks, setSelectedTasks] = useState(tasks.slice(0, tasksPerPage))
  const anchorRef = useRef(null)
  
  const Tasks = () => (
    <div>
      {tasks && tasks.length > 0 && (
        <TaskCardGroup>
          {selectedTasks.map((t, index) => (
            <DraggableTaskCard
              margin={index === 0}
              key={t.id}
              task={t}
              onActionClick={() =>
                assignTaskHandler(t)
              }
              action={actionTaskButton}
              isAssigned={isDropArea}
            />
          ))}
        </TaskCardGroup>
      )}
      {tasks &&
        tasks.length === 0 &&
        !isLoading && (
          <NoTaskMessage>
            {noTaskMessage || 'There are no tasks.'}
          </NoTaskMessage>
      )}
    </div>
  )

  const handleSelectedPage = page => {
    anchorRef.current.scrollIntoView()
    const init = page * tasksPerPage
    const end = (page + 1) * tasksPerPage
    setSelectedTasks(tasks.slice(init, end))
    setSelectedPage(page)
  }

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
            {!isLoading &&
              tasks &&
              tasks.length > 0 && (
                <span>({tasks.length})</span>
              )}
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
      {tasks.length > tasksPerPage && (
        <Pagination 
          pages={Math.ceil(tasks.length / tasksPerPage)}
          selected={selectedPage} 
          onChange={handleSelectedPage} 
        />
      )}
    </div>
    
  )
}

const NoTaskMessage = styled.div`
  color: grey;
  margin-left: 2%;
  margin-bottom: 5%;
`

export default DraggableTasksSection
