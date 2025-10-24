import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const histories = await db.gensetHistory.findMany({
      include: {
        genset: true
      },
      orderBy: { tanggal: 'asc' } // Ubah dari 'desc' ke 'asc' untuk tanggal lama ke baru
    })
    return NextResponse.json(histories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch histories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tanggal, uraian, keterangan, gensetIds } = await request.json()
    
    if (!tanggal || !uraian || !gensetIds || gensetIds.length === 0) {
      return NextResponse.json({ error: 'tanggal, uraian, and gensetIds are required' }, { status: 400 })
    }

    // Jika gensetIds mengandung 'all', berarti tambahkan untuk semua genset
    if (gensetIds.includes('all')) {
      const allGensets = await db.genset.findMany()
      const histories = await db.gensetHistory.createMany({
        data: allGensets.map(genset => ({
          tanggal: new Date(tanggal),
          uraian,
          keterangan,
          gensetId: genset.id
        }))
      })
      
      return NextResponse.json({ 
        message: `Created ${histories.count} histories for all gensets`,
        count: histories.count 
      }, { status: 201 })
    } else {
      // Buat multiple histories untuk genset yang dipilih
      const histories = await db.gensetHistory.createMany({
        data: gensetIds.map(gensetId => ({
          tanggal: new Date(tanggal),
          uraian,
          keterangan,
          gensetId
        }))
      })
      
      return NextResponse.json({ 
        message: `Created ${histories.count} histories`,
        count: histories.count 
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating histories:', error)
    return NextResponse.json({ error: 'Failed to create histories' }, { status: 500 })
  }
}