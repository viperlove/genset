import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Create sample gensets
    const genset1 = await db.genset.upsert({
      where: { name: 'Genset A - 100 KVA' },
      update: {},
      create: { name: 'Genset A - 100 KVA' }
    })

    const genset2 = await db.genset.upsert({
      where: { name: 'Genset B - 150 KVA' },
      update: {},
      create: { name: 'Genset B - 150 KVA' }
    })

    const genset3 = await db.genset.upsert({
      where: { name: 'Genset C - 200 KVA' },
      update: {},
      create: { name: 'Genset C - 200 KVA' }
    })

    // Create sample histories
    const sampleHistories = [
      {
        tanggal: new Date('2024-01-15'),
        uraian: 'Perawatan rutin bulanan',
        keterangan: 'Penggantian oli filter, pemeriksaan sistem pendingin',
        gensetId: genset1.id
      },
      {
        tanggal: new Date('2024-01-20'),
        uraian: 'Pemeliharaan sistem bahan bakar',
        keterangan: 'Pembersihan tangki dan filter bahan bakar',
        gensetId: genset2.id
      },
      {
        tanggal: new Date('2024-02-01'),
        uraian: 'Test load bank',
        keterangan: 'Testing kapasitas maksimal genset',
        gensetId: genset3.id
      },
      {
        tanggal: new Date('2024-02-10'),
        uraian: 'Perbaikan sistem starter',
        keterangan: 'Penggantian aki dan perbaikan relay starter',
        gensetId: genset1.id
      },
      {
        tanggal: new Date('2024-02-15'),
        uraian: 'Inspeksi tahunan',
        keterangan: 'Pemeriksaan lengkap semua komponen genset',
        gensetId: genset2.id
      }
    ]

    for (const history of sampleHistories) {
      await db.gensetHistory.create({
        data: history
      })
    }

    return NextResponse.json({ message: 'Sample data created successfully' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to create sample data' }, { status: 500 })
  }
}