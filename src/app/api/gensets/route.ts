import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const gensets = await db.genset.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(gensets)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gensets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const genset = await db.genset.create({
      data: { name }
    })
    
    return NextResponse.json(genset, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create genset' }, { status: 500 })
  }
}