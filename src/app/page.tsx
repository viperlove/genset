'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SafeSelect, SafeSelectItem } from '@/components/ui/safe-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Plus, Edit, Trash2, Upload, Download, FileSpreadsheet, Filter } from 'lucide-react'
import { toast } from 'sonner'

// Fungsi formatting yang aman
const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split('T')[0]
}

interface Genset {
  id: string
  name: string
}

interface GensetHistory {
  id: string
  tanggal: string
  uraian: string
  keterangan: string
  gensetId: string
  genset: Genset
}

export default function Home() {
  const [histories, setHistories] = useState<GensetHistory[]>([])
  const [gensets, setGensets] = useState<Genset[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenset, setSelectedGenset] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGensetDialogOpen, setIsGensetDialogOpen] = useState(false)
  const [editingHistory, setEditingHistory] = useState<GensetHistory | null>(null)
  const [newGensetName, setNewGensetName] = useState('')
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    tanggal: '',
    uraian: '',
    keterangan: '',
    gensetIds: [] as string[]
  })
  const [selectAllGensets, setSelectAllGensets] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchGensets()
    fetchHistories()
  }, [])

  const fetchGensets = async () => {
    try {
      const response = await fetch('/api/gensets')
      const data = await response.json()
      setGensets(data)
    } catch (error) {
      if (isClient) toast.error('Gagal mengambil data genset')
    }
  }

  const fetchHistories = async () => {
    try {
      const response = await fetch('/api/histories')
      const data = await response.json()
      // Sort dari tanggal lama ke baru (ascending)
      const sortedData = data.sort((a: GensetHistory, b: GensetHistory) => 
        new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
      )
      setHistories(sortedData)
    } catch (error) {
      if (isClient) toast.error('Gagal mengambil data riwayat')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi: pastikan setidaknya satu genset dipilih
    if (formData.gensetIds.length === 0 && !selectAllGensets) {
      toast.error('Pilih setidaknya satu genset')
      return
    }
    
    // Jika select all gensets, kirim flag khusus
    const payload = selectAllGensets 
      ? { ...formData, gensetIds: ['all'] }
      : formData
    
    try {
      const response = await fetch('/api/histories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success(`Riwayat berhasil ditambahkan (${result.count} record)`)
        fetchHistories()
        setFormData({ tanggal: '', uraian: '', keterangan: '', gensetIds: [] })
        setSelectAllGensets(false)
        setIsAddDialogOpen(false)
      }
    } catch (error) {
      toast.error('Gagal menambah riwayat')
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHistory) return
    
    // Validasi: pastikan setidaknya satu genset dipilih
    if (formData.gensetIds.length === 0) {
      toast.error('Pilih genset')
      return
    }
    
    try {
      const response = await fetch(`/api/histories/${editingHistory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast.success('Riwayat berhasil diperbarui')
        fetchHistories()
        setIsEditDialogOpen(false)
        setEditingHistory(null)
        setFormData({ tanggal: '', uraian: '', keterangan: '', gensetIds: [] })
        setSelectAllGensets(false)
      }
    } catch (error) {
      toast.error('Gagal memperbarui riwayat')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) return
    
    try {
      const response = await fetch(`/api/histories/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Riwayat berhasil dihapus')
        fetchHistories()
      }
    } catch (error) {
      toast.error('Gagal menghapus riwayat')
    }
  }

  const handleAddGenset = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/gensets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGensetName })
      })
      
      if (response.ok) {
        toast.success('Genset berhasil ditambahkan')
        fetchGensets()
        setNewGensetName('')
        setIsGensetDialogOpen(false)
      }
    } catch (error) {
      toast.error('Gagal menambah genset')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Data berhasil diimport')
        fetchHistories()
        fetchGensets()
      }
    } catch (error) {
      toast.error('Gagal mengimport data')
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'riwayat-genset.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Data berhasil diexport')
    } catch (error) {
      toast.error('Gagal menexport data')
    }
  }

  const handleFilteredExport = async () => {
    try {
      const response = await fetch('/api/export/filtered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchTerm,
          selectedGenset
        })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('content-disposition')
        let filename = 'riwayat-genset-filter.xlsx'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Data filter berhasil diexport')
      } else {
        toast.error('Gagal menexport data filter')
      }
    } catch (error) {
      toast.error('Gagal menexport data filter')
    }
  }

  const openEditDialog = (history: GensetHistory) => {
    setEditingHistory(history)
    setFormData({
      tanggal: new Date(history.tanggal).toISOString().split('T')[0],
      uraian: history.uraian,
      keterangan: history.keterangan || '',
      gensetIds: [history.gensetId] // Untuk edit, gunakan genset tunggal
    })
    setSelectAllGensets(false)
    setIsEditDialogOpen(true)
  }

  const handleGensetCheckboxChange = (gensetId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        gensetIds: [...prev.gensetIds, gensetId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        gensetIds: prev.gensetIds.filter(id => id !== gensetId)
      }))
    }
  }

  const handleSelectAllGensetsChange = (checked: boolean) => {
    setSelectAllGensets(checked)
    if (checked) {
      setFormData(prev => ({
        ...prev,
        gensetIds: gensets.map(g => g.id)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        gensetIds: []
      }))
    }
  }

  const filteredHistories = histories.filter(history => {
    const matchesSearch = history.uraian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         history.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         history.genset.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenset = selectedGenset === 'all' || history.gensetId === selectedGenset
    return matchesSearch && matchesGenset
  }).sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) // Sort dari lama ke baru

  if (!isClient) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Riwayat Peralatan Genset</h1>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label htmlFor="import-file">
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </span>
            </Button>
          </label>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Semua
          </Button>
          <Button variant="outline" onClick={handleFilteredExport}>
            <Filter className="w-4 h-4 mr-2" />
            Export Filter
          </Button>
          <Dialog open={isGensetDialogOpen} onOpenChange={setIsGensetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Tambah Genset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Genset Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddGenset} className="space-y-4">
                <div>
                  <Label htmlFor="genset-name">Nama Genset</Label>
                  <Input
                    id="genset-name"
                    value={newGensetName}
                    onChange={(e) => setNewGensetName(e.target.value)}
                    placeholder="Masukkan nama genset"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Tambah Genset
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) {
              setSelectAllGensets(false)
              setFormData({ tanggal: '', uraian: '', keterangan: '', gensetIds: [] })
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Riwayat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Riwayat Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="tanggal">Tanggal</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-base font-medium">Pilih Genset</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all-gensets"
                        checked={selectAllGensets}
                        onCheckedChange={handleSelectAllGensetsChange}
                      />
                      <Label htmlFor="select-all-gensets" className="text-sm font-medium">
                        Semua Genset
                      </Label>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
                      {gensets.map((genset) => (
                        <div key={genset.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`genset-${genset.id}`}
                            checked={formData.gensetIds.includes(genset.id)}
                            onCheckedChange={(checked) => handleGensetCheckboxChange(genset.id, checked as boolean)}
                          />
                          <Label htmlFor={`genset-${genset.id}`} className="text-sm">
                            {genset.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="uraian">Uraian</Label>
                  <Input
                    id="uraian"
                    value={formData.uraian}
                    onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                    placeholder="Masukkan uraian"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea
                    id="keterangan"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Masukkan keterangan (opsional)"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Simpan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pencarian dan Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan uraian, keterangan, atau nama genset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <SafeSelect value={selectedGenset} onValueChange={setSelectedGenset} className="w-48" placeholder="Filter genset">
              <SafeSelectItem value="all">Semua Genset</SafeSelectItem>
              {gensets.map((genset) => (
                <SafeSelectItem key={genset.id} value={genset.id}>
                  {genset.name}
                </SafeSelectItem>
              ))}
            </SafeSelect>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Riwayat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Genset</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Tidak ada data riwayat
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistories.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{formatDate(history.tanggal)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{history.genset.name}</Badge>
                      </TableCell>
                      <TableCell>{history.uraian}</TableCell>
                      <TableCell>{history.keterangan || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(history)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(history.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setSelectAllGensets(false)
          setEditingHistory(null)
          setFormData({ tanggal: '', uraian: '', keterangan: '', gensetIds: [] })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Riwayat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-tanggal">Tanggal</Label>
              <Input
                id="edit-tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-genset">Genset</Label>
              <SafeSelect 
                value={formData.gensetIds[0] || ''} 
                onValueChange={(value) => setFormData({ ...formData, gensetIds: [value] })} 
                placeholder="Pilih genset"
              >
                {gensets.map((genset) => (
                  <SafeSelectItem key={genset.id} value={genset.id}>
                    {genset.name}
                  </SafeSelectItem>
                ))}
              </SafeSelect>
            </div>
            <div>
              <Label htmlFor="edit-uraian">Uraian</Label>
              <Input
                id="edit-uraian"
                value={formData.uraian}
                onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                placeholder="Masukkan uraian"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-keterangan">Keterangan</Label>
              <Textarea
                id="edit-keterangan"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Masukkan keterangan (opsional)"
              />
            </div>
            <Button type="submit" className="w-full">
              Perbarui
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}