import React, { ReactElement } from 'react'

import AgendaItem from 'src/models/AgendaItem'

import EventCell from '../EventCell'

import style from './style.scss'
import List from '../List'

interface Props {
  events: AgendaItem[]
  department: string
}

const EventList = ({ events, department }: Props): ReactElement => {
  return (
    events.length > 0 && (
      <List>
        {department !== 'All' && (
          <div className={style.department}>
            <span className={style.departmentTitle}>
              {department || 'Other'}
            </span>
          </div>
        )}
        {events.map((event) => (
          <EventCell
            calendar={event.calendar}
            event={event.event}
            key={event.event.id}
          />
        ))}
      </List>
    )
  )
}

export default EventList
