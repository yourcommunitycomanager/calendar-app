'use client'

import { useState, useEffect, useRef } from 'react'

const COLORS = [{hex: '#3b82f6', label:'Blue'},{hex:'#10b981', label:'Green'},{hex:'#f59e0b',label:'Amber'},{hex:'#ef4444',label:'Red'},{hex:'#8b5cf6',label:'Purple'},{hex:'#ec4899', label:'Pink'},{hex:'#14b8a6', label:'Teal'},{hex:'#f97316', label:'Orange'}]

export default function EventModal({ modal, onSave, onDelete, onClose }) {
  const isEdit = modal.type === 'edit'
  const [title, setTitle] = useState(isEdit ? modal.event.title : '')
  const [description, setDescription] = useState(isEdit ? (modal.event.description || '') : '')
  const [date, setDate] = useState(isEdit ? modal.event.date?.slice(0,10) : modal.date || '')
  const [color, setColor] = useState(isEdit ? (modal.event.color || '#3b82f6') : '#3b82f6')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef(null)
  useEffect(() => { titleRef.current?.focus() }, [])
  useEffect(() => { const h = e => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  const handleSubmit = async e => { e.preventDefault(); if (!title.trim() || !date) return; setSaving(true); await onSave({ title: title.trim(), description: description.trim(), date, color }); setSaving(false) }
  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">×</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-400">*</span></label><input ref={titleRef} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Team meeting" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-400">*</span></label><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Color</label><div className="flex gap-2 flex-wrap">{COLORS.map(({ hex, label }) => <button key={hex} type="button" aria-label={label} onClick={() => setColor(hex)} className={`w-7 h-7 rounded-full transition-all ${color === hex ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'}`} style={{backgroundColor: hex}} />)}</div></div>
          <div className="flex gap-2 pt-2 pb-1">
            <button type="submit" disabled={saving || !title.trim() || !date} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add event'}</button>
            {onDelete && !confirmDelete && <button type="button" onClick={() => setConfirmDelete(true)} className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>}
            {onDelete && confirmDelete && <button type="button" onClick={onDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Confirm</button>}
          </div>
        </form>
      </div>
    </div>
  )
}
