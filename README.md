# Aplikasi Riwayat Peralatan Genset

Aplikasi web berbasis Next.js untuk mengelola riwayat peralatan genset dengan fitur lengkap import/export Excel.

## Fitur Utama

### 📊 Manajemen Riwayat
- **Tambah Riwayat**: Form lengkap untuk menambahkan riwayat maintenance genset
- **Edit Riwayat**: Memperbarui data riwayat yang sudah ada
- **Hapus Riwayat**: Menghapus riwayat dengan konfirmasi
- **Tabel Riwayat**: Tampilan data yang terorganisir dengan sorting

### 🔍 Pencarian & Filter
- **Search Global**: Mencari berdasarkan uraian, keterangan, atau nama genset
- **Filter Genset**: Menyaring data berdasarkan genset tertentu
- **Real-time Search**: Hasil pencarian langsung muncul saat mengetik

### 📁 Import/Export Excel
- **Import Excel**: Upload file Excel dengan kolom:
  - `tanggal` (format: YYYY-MM-DD atau DD/MM/YYYY)
  - `uraian` (wajib diisi)
  - `keterangan` (opsional)
  - `nama_genset` (wajib diisi)
- **Export Excel**: Download data riwayat dalam format Excel yang terstruktur

### ⚙️ Manajemen Genset
- **Tambah Genset**: Menambahkan unit genset baru
- **Auto-create**: Genset otomatis dibuat saat import data dengan nama baru

## Cara Penggunaan

### 1. Menambah Riwayat Baru
1. Klik tombol "Tambah Riwayat" (warna biru dengan ikon +)
2. Isi form:
   - **Tanggal**: Pilih tanggal maintenance
   - **Genset**: Pilih dari dropdown atau tambah baru
   - **Uraian**: Jelaskan jenis maintenance
   - **Keterangan**: Tambahkan detail tambahan (opsional)
3. Klik "Simpan"

### 2. Import Data Excel
1. Siapkan file Excel dengan format:
   ```
   | tanggal    | uraian                    | keterangan                | nama_genset      |
   |------------|---------------------------|---------------------------|------------------|
   | 2024-01-15 | Perawatan rutin           | Ganti oli                 | Genset A - 100KVA|
   | 2024-01-20 | Test load                 | Testing kapasitas         | Genset B - 150KVA|
   ```
2. Klik "Import Excel" dan pilih file
3. Data akan otomatis diproses dan ditambahkan

### 3. Export Data
1. Klik tombol "Export Excel" (hijau dengan ikon download)
2. File Excel akan otomatis diunduh
3. File berisi semua data riwayat yang ada

### 4. Mengelola Genset
1. Klik "Tambah Genset" untuk menambah unit baru
2. Saat import Excel, genset baru akan otomatis dibuat jika belum ada

## Struktur Database

### Genset
- `id`: Unique identifier
- `name`: Nama genset (unique)
- `createdAt`: Tanggal dibuat
- `updatedAt`: Tanggal diperbarui

### GensetHistory
- `id`: Unique identifier
- `tanggal`: Tanggal maintenance
- `uraian`: Deskripsi maintenance
- `keterangan`: Keterangan tambahan
- `gensetId`: Foreign key ke Genset
- `createdAt`: Tanggal dibuat
- `updatedAt`: Tanggal diperbarui

## API Endpoints

### Genset Management
- `GET /api/gensets` - Ambil semua genset
- `POST /api/gensets` - Tambah genset baru

### History Management
- `GET /api/histories` - Ambil semua riwayat
- `POST /api/histories` - Tambah riwayat baru
- `PUT /api/histories/[id]` - Update riwayat
- `DELETE /api/histories/[id]` - Hapus riwayat

### Import/Export
- `POST /api/import` - Import file Excel
- `GET /api/export` - Export ke Excel

### Data Seeding
- `GET /api/seed` - Buat data contoh untuk testing

## Teknologi

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **Excel Processing**: XLSX library
- **UI Components**: shadcn/ui dengan Lucide icons
- **Notifications**: Sonner toast

## Instalasi & Development

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Tips Penggunaan

1. **Format Tanggal**: Gunakan format yang konsisten (YYYY-MM-DD)
2. **Backup Data**: Export data secara berkala untuk backup
3. **Validasi Import**: Pastikan nama kolom sesuai format
4. **Search**: Gunakan kata kunci spesifik untuk pencarian lebih cepat
5. **Filter**: Manfaatkan filter genset untuk fokus pada unit tertentu

## Troubleshooting

### Import Gagal
- Pastikan file Excel memiliki kolom yang benar
- Periksa format tanggal (gunakan YYYY-MM-DD)
- Pastikan tidak ada data duplikat

### Export Tidak Berfungsi
- Refresh halaman dan coba lagi
- Periksa koneksi internet
- Pastikan browser tidak memblokir download

### Data Tidak Muncul
- Refresh halaman
- Periksa koneksi database
- Coba restart development server

### Hydration Error (Final Solution - Fixed)
- Menggunakan `isClient` state dengan conditional rendering sederhana
- Server hanya merender loading skeleton
- Client merender full content setelah mounting complete
- Tidak ada lagi warning hydration di console

### DOM removeChild Error (Fixed)
- Pendekatan fundamental yang menghilangkan semua potensi konflik DOM
- Tidak ada complex component wrapping yang menyebabkan manipulation conflicts
- State management yang bersih dan predictable
- React lifecycle yang tepat untuk client-side rendering

## Teknis Implementation

### Final Hydration & DOM Error Solution
```typescript
// 1. Simple isClient state approach
export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    fetchGensets()
    fetchHistories()
  }, [])

  // 2. Early return for server-side rendering
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

  // 3. Full client-side rendering
  return (
    <div className="container mx-auto p-6">
      {/* All interactive content */}
    </div>
  )
}

// 4. Safe toast calls
const fetchGensets = async () => {
  try {
    const response = await fetch('/api/gensets')
    const data = await response.json()
    setGensets(data)
  } catch (error) {
    if (isClient) toast.error('Gagal mengambil data genset')
  }
}

// 5. Consistent date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toISOString().split('T')[0]
}
```

---

Aplikasi ini dirancang untuk memudahkan manajemen riwayat maintenance genset dengan interface yang intuitif dan fitur lengkap. Semua error terkait hydration dan DOM manipulation telah diperbaiki untuk pengalaman pengguna yang optimal dan stabil.