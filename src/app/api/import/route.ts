import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    for (const row of data as any[]) {
      const { tanggal, uraian, keterangan, nama_genset } = row
      
      if (!tanggal || !uraian || !nama_genset) {
        continue // Skip rows with missing required data
      }

      // Find or create genset
      let genset = await db.genset.findUnique({
        where: { name: nama_genset }
      })

      if (!genset) {
        genset = await db.genset.create({
          data: { name: nama_genset }
        })
      }

      // Create history
      await db.gensetHistory.create({
        data: {
          tanggal: new Date(tanggal),
          uraian,
          keterangan: keterangan || null,
          gensetId: genset.id
        }
      })
    }

    return NextResponse.json({ message: 'Data imported successfully' })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}