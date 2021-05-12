import React, { ReactElement, useContext, useMemo, useState } from 'react'
import { DateTime } from 'luxon'

import greeting from 'lib/greeting'

import Calendar from 'src/models/Calendar'
import AgendaItem from 'src/models/AgendaItem'
import AccountContext from 'src/context/accountContext'

import EventList from './EventList'

import style from './style.scss'
import { uniq } from 'lodash'

const compareByDateTime = (a: AgendaItem, b: AgendaItem) =>
  a.event.date.diff(b.event.date).valueOf()

/**
 * Agenda component
 * Displays greeting (depending on time of day)
 * and list of calendar events
 */

const Agenda = (): ReactElement => {
  const initialCalendarFilter: string = 'All'
  const [calendarFilter, setCalendarFilter] = useState<String>(
    initialCalendarFilter,
  )
  const [groupByDepartment, setGroupByDepartment] = useState<Boolean>(false)
  const account = useContext(AccountContext)

  const calendars: Calendar[] = useMemo(() => account.calendars, [])

  const eventCategories: string[] = uniq(
    calendars
      .flatMap((calendar) => calendar.events.map((event) => event.department))
      .sort(),
  )

  const events: AgendaItem[] = useMemo(() => {
    const regularEvents = calendars
      .flatMap((calendar) =>
        calendar.events.map((event) => ({ calendar, event })),
      )
      .sort(compareByDateTime)
    if (calendarFilter !== initialCalendarFilter) {
      return regularEvents.filter(
        (agendaItem) => agendaItem.calendar.id === calendarFilter,
      )
    } else {
      return regularEvents
    }
  }, [account, calendarFilter])

  const eventsByCategory = (department: string): AgendaItem[] =>
    events.filter((event) => event.event.department === department)

  const title = useMemo(
    () => greeting(DateTime.local().hour),
    [DateTime.local().hour],
  )

  const groupOrUngroupByDepartment = (): void =>
    setGroupByDepartment(!groupByDepartment)

  const onCalendarSelection = (e: any): void =>
    setCalendarFilter(e.target.value)

  return (
    <div className={style.outer}>
      <div className={style.container}>
        <div className={style.header}>
          <span className={style.title}>{title}</span>
          <select onChange={onCalendarSelection}>
            <option value={initialCalendarFilter}>
              {initialCalendarFilter}
            </option>
            {calendars.map((calendar, ind) => (
              <option key={calendar.id} value={calendar.id}>
                Calendar {ind + 1}
              </option>
            ))}
          </select>
        </div>
        <div className={style.button}>
          <button onClick={groupOrUngroupByDepartment}>
            {groupByDepartment ? 'Ungroup' : 'Group'} by department
          </button>
          <span className={style.error}>
            {account.error && 'Error fetching account. Reattempting...'}
          </span>
        </div>
        {groupByDepartment ? (
          eventCategories.map((eventCategory) => (
            <EventList
              events={eventsByCategory(eventCategory)}
              department={eventCategory}
              key={eventCategory || 'Other'}
            />
          ))
        ) : (
          <EventList events={events} department={initialCalendarFilter} />
        )}
      </div>
    </div>
  )
}

export default Agenda
