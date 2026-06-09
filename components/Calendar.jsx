'use client'

import { useState, useEffect, useCallback } from 'react'
import EventModal from './EventModal'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function Calendar() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/events?year=${currentYear}&month=${currentMonth + 1}`)
      const data = await res.json()
      setEvents(Array.isArray(data) ? data : [])
    } catch (e) {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentYear, currentMonth])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const goToPrevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else { setCurrentMonth(m => m - 1) } }
  const goToNextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else { setCurrentMonth(m => m + 1) } }
  const goToToday = () => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()) }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const cells = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => (typeof e.date === 'string' ? e.date.slice(0, 10) : '') === dateStr)
  }
  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const handleDayClick = (day) => { setModal({ type: 'add', date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` }) }
  const handleEventClick = (e, event) => { e.stopPropagation(); setModal({ type: 'edit', event }) }

  const handleSave = async (data) => {
    try {
      if (modal.type === 'add') { await fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) }
      else { await fetch(`/api/events/${modal.event.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) }
    } catch (e) {}
    setModal(null); fetchEvents()
  }
  const handleDelete = async () => {
    try { await fetch(`/api/events/${modal.event.id}`, { method: 'DELETE' }) } catch (e) {}
    setModal(null); fetchEvents()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 w-56">{MONTHS[currentMonth]} {currentYear}</h1>
          {loading && <span className="text-sm text-gray-400">Loading…</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">Today</button>
          <div className="flex">
            <button onClick={goToPrevMonth} className="p-2 rounded-l-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">‹</button>
            <button onClick={goToNextMonth} className="p-2 rounded-r-lg border border-l-0 border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">›</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-gray-200">
        {cells.map((day, i) => {
          const dayEvents = day ? getEventsForDay(day) : []
          return (
            <div key={i} onClick={() => day && handleDayClick(day)}
              className={`border-r border-b border-gray-200 min-h-[110px] p-1.5 ${day ? 'cursor-pointer hover:bg-blue-50/40 transition-colors' : 'bg-gray-50/60'}`}>
              {day && <>
                <span className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mb-1 ${isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{day}</span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(event => (
                    <div key={event.id} onClick={e => handleEventClick(e, event)} title={event.title}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{backgroundColor: event.color || '#3b82f6'}}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <p className="text-xs text-gray-400 px-1.5">+{dayEvents.length - 3} more</p>}
                </div>
              </>}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-gray-400 text-center">Click any day to add an event · Click an event to edit or delete</p>
      {modal && <EventModal modal={modal} onSave={handleSave} onDelete={modal.type === 'edit' ? handleDelete : undefined} onClose={() => setModal(null)} />}
    </div>
  )
}
