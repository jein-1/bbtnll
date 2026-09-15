export const metadata = {
  title: 'Galeri Media',
}

export default function GaleriPage() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 text-center">
          Galeri Media
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Koleksi foto dan video keindahan Taman Nasional Lore Lindu.
        </p>

        {/* Masonry-like Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative group cursor-pointer">
              {/* Simulate different heights for masonry effect */}
              <div className={`w-full ${i % 3 === 0 ? 'h-96' : i % 2 === 0 ? 'h-64' : 'h-80'} flex items-center justify-center text-slate-400`}>
                [Gambar {i}]
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">Lihat Gambar</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
