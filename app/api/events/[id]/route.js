import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  const { id } = params
  const { title, description, date, color } = await request.json()

  try {
    const result = await sql`
      UPDATE events
      SET title = ${title},
          description = ${description || null},
          date = ${date},
          color = ${color || '#3b82f6'}
      WHERE id = ${id}
      RETURNING *
    `
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const { id } = params

  try {
    await sql`DELETE FROM events WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
