import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tanggal, uraian, keterangan, gensetIds } = await request.json()
    
    if (!tanggal || !uraian || !gensetIds || gensetIds.length === 0) {
      return NextResponse.json({ error: 'tanggal, uraian, and gensetIds are required' }, { status: 400 })
    }

    // Untuk edit, gunakan genset pertama dari array
    const gensetId = gensetIds[0]

    const history = await db.gensetHistory.update({
      where: { id: params.id },
      data: {
        tanggal: new Date(tanggal),
        uraian,
        keterangan,
        gensetId
      },
      include: {
        genset: true
      }
    })
    
    return NextResponse.json(history)
  } catch (error) {
    console.error('Error updating history:', error)
    return NextResponse.json({ error: 'Failed to update history' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.gensetHistory.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'History deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 })
  }
}