import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-black text-emerald-600/20 dark:text-emerald-500/10 mb-4 tracking-tighter">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Halaman Tidak Ditemukan
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
        Maaf, halaman yang Anda cari tidak ada, telah dihapus, atau namanya diubah.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-600/20"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
