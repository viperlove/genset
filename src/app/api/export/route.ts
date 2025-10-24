import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

export async function GET() {
  try {
    const histories = await db.gensetHistory.findMany({
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Riwayat Genset')

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Return as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="riwayat-genset.xlsx"'
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}