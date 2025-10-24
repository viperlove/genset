import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { searchTerm, selectedGenset } = await request.json()

    // Build where clause based on filters
    const where: any = {}
    
    if (selectedGenset && selectedGenset !== 'all') {
      where.gensetId = selectedGenset
    }
    
    if (searchTerm) {
      where.OR = [
        { uraian: { contains: searchTerm } },
        { keterangan: { contains: searchTerm } },
        { genset: { name: { contains: searchTerm } } }
      ]
    }

    const histories = await db.gensetHistory.findMany({
      where,
      include: {
        genset: true
      },
      orderBy: { tanggal: 'asc' } // Ubah ke ascending untuk tanggal lama ke baru
    })

    // Transform data for Excel dengan urutan: tanggal, nama genset, uraian, keterangan
    const excelData = histories.map(history => ({
      'Tanggal': new Date(history.tanggal).toISOString().split('T')[0],
      'Nama Genset': history.genset.name,
      'Uraian': history.uraian,
      'Keterangan': history.keterangan || ''
    }))

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Set column widths sesuai urutan baru
    const colWidths = [
      { wch: 15 }, // Tanggal
      { wch: 20 }, // Nama Genset
      { wch: 30 }, // Uraian
      { wch: 30 }  // Keterangan
    ]
    worksheet['!cols'] = colWidths

    // Generate filename based on filters
    let filename = 'riwayat-genset'
    if (selectedGenset && selectedGenset !== 'all') {
      // Get genset name for filename
      const genset = await db.genset.findUnique({
        where: { id: selectedGenset },
        select: { name: true }
      })
      if (genset) {
        filename += `-${genset.name.toLowerCase().replace(/\s+/g, '-')}`
      }
    }
    if (searchTerm) {
      filename += `-search-${searchTerm.toLowerCase().replace(/\s+/g, '-')}`
    }
    filename += '.xlsx'

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Genset Filter')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Filtered export error:', error)
    return NextResponse.json({ error: 'Failed to export filtered data' }, { status: 500 })
  }
}