import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Berita & Artikel',
}

export default function BeritaPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Berita Terbaru</h1>
            <p className="text-slate-600 dark:text-slate-400">Informasi dan pengumuman resmi seputar TNLL.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <article key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 relative">
                <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Pengumuman
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <Calendar className="w-4 h-4" /> 15 September 2026
                </div>
                <h3 className="text-xl font-bold mb-3 line-clamp-2">
                  Penutupan Sementara Jalur Pendakian Gunung Nokilalaki
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6">
                  Sehubungan dengan cuaca ekstrem dan badai yang melanda wilayah pegunungan, Balai Besar TNLL memutuskan untuk menutup sementara seluruh jalur pendakian demi keselamatan pengunjung.
                </p>
                <Link href={`/berita/sample-${i}`} className="text-emerald-600 font-semibold flex items-center gap-2 hover:text-emerald-700 transition-colors">
                  Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
