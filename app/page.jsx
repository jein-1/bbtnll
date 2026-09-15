import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, TreePine, Leaf, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent z-10" />
          {/* Placeholder Hero Image - In real app, fetch from CMS or use static high-res */}
          <div className="w-full h-full bg-slate-800 bg-[url('https://images.unsplash.com/photo-1542224566-6e85f2e10715?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8 text-center text-white mt-16">
          <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 text-sm font-medium mb-6 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            Selamat Datang di Jantung Sulawesi
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Taman Nasional <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">
              Lore Lindu
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Jelajahi keajaiban megalitik kuno, flora endemik, dan satwa liar langka di salah satu cagar biosfer dunia yang paling memukau.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/destinasi">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-14 px-8 text-base shadow-lg shadow-emerald-600/30">
                Mulai Menjelajah <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tentang">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full h-14 px-8 text-base border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── QUICK FEATURES ───────────────────────────────────────────────── */}
      <section className="relative z-30 -mt-16 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TreePine, title: 'Destinasi Unggulan', desc: 'Danau Tambing, Lembah Bada, dan spot eksotis lainnya.' },
            { icon: Leaf, title: 'Cagar Biosfer', desc: 'Rumah bagi ratusan spesies flora dan fauna endemik.' },
            { icon: Camera, title: 'Galeri Alam', desc: 'Koleksi momen menakjubkan dari pengunjung kami.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex items-start gap-4 transform transition-transform hover:-translate-y-1 hover:shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED DESTINATIONS ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">
                Eksplorasi
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                Destinasi Favorit
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Pilih petualangan Anda berikutnya dari daftar lokasi paling memukau yang sering dikunjungi.
              </p>
            </div>
            <Link href="/destinasi">
              <Button variant="outline" className="rounded-full group">
                Lihat Semua <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Destinasi Card Skeleton/Placeholder (Nanti diganti dengan fetch data) */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="group rounded-2xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm">
                    Wisata Alam
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Sulawesi Tengah</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Memuat Destinasi...
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">
                    Deskripsi singkat destinasi akan ditampilkan di sini.
                  </p>
                  <Button className="w-full bg-slate-100 hover:bg-emerald-600 text-slate-900 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-white transition-colors">
                    Detail Lokasi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
