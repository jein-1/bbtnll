import Link from 'next/link'
import { MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const metadata = {
  title: 'Destinasi Wisata',
}

export default function DestinasiPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header Section */}
      <div className="bg-emerald-900 text-white py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Jelajahi Destinasi
          </h1>
          <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
            Temukan lokasi-lokasi eksotis di dalam kawasan Taman Nasional Lore Lindu.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input placeholder="Cari destinasi..." className="pl-10 h-12 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">Semua</Button>
            <Button variant="ghost" className="rounded-xl text-slate-500">Danau</Button>
            <Button variant="ghost" className="rounded-xl text-slate-500">Megalitikum</Button>
            <Button variant="ghost" className="rounded-xl text-slate-500">Hutan</Button>
          </div>
        </div>

        {/* Grid Destinasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
              <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800 relative">
                 {/* Placeholder Image */}
                 <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    [Gambar Destinasi {i}]
                 </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-3">
                  <MapPin className="w-4 h-4" /> Zona Pemanfaatan
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">
                  Nama Destinasi {i}
                </h3>
                <p className="text-slate-500 line-clamp-2 mb-6">
                  Deskripsi singkat mengenai keindahan dan fasilitas yang ada di destinasi ini. Sangat cocok untuk wisata keluarga dan penelitian.
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">Rp 5.000 <span className="text-xs font-normal text-slate-500">/ tiket</span></span>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-full px-6">
                    Lihat Detail
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
