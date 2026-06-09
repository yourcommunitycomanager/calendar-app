import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  try {
    let result
    if (year && month) {
      result = await sql`
        SELECT * FROM events
        WHERE EXTRACT(YEAR FROM date) = ${year}
          AND EXTRACT(MONTH FROM date) = ${month}
        ORDER BY date, created_at
      `
    } else {
      result = await sql`SELECT * FROM events ORDER BY date, created_at`
    }
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  const { title, description, date, color } = await request.json()

  try {
    const result = await sql`
      INSERT INTO events (title, description, date, color)
      VALUES (${title}, ${description || null}, ${date}, ${color || '#3b82f6'})
      RETURNING *
    `
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
