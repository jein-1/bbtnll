import Link from 'next/link'
import { MapPin, Phone, Mail } from 'lucide-react'

const FacebookIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const InstagramIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
const YoutubeIcon = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>


export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & About */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">T</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">TNLL Explore</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Platform resmi pemesanan tiket wisata dan pusat informasi Taman Nasional Lore Lindu. Jelajahi keindahan alam, flora endemik, fauna langka, dan budaya megalitik di Jantung Sulawesi.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-colors">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Pintasan</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/destinasi" className="hover:text-emerald-400 transition-colors text-sm">Destinasi Wisata</Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-emerald-400 transition-colors text-sm">Berita & Pengumuman</Link>
              </li>
              <li>
                <Link href="/flora-fauna" className="hover:text-emerald-400 transition-colors text-sm">Ensiklopedia Flora & Fauna</Link>
              </li>
              <li>
                <Link href="/galeri" className="hover:text-emerald-400 transition-colors text-sm">Galeri Media</Link>
              </li>
              <li>
                <Link href="/panduan" className="hover:text-emerald-400 transition-colors text-sm">Panduan Pengunjung</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-white font-semibold mb-6">Dukungan</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors text-sm">Tanya Jawab (FAQ)</Link>
              </li>
              <li>
                <Link href="/cara-pesan" className="hover:text-emerald-400 transition-colors text-sm">Cara Pesan Tiket</Link>
              </li>
              <li>
                <Link href="/kebijakan-privasi" className="hover:text-emerald-400 transition-colors text-sm">Kebijakan Privasi</Link>
              </li>
              <li>
                <Link href="/syarat-ketentuan" className="hover:text-emerald-400 transition-colors text-sm">Syarat & Ketentuan</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-400">Jl. Prof. Moh. Yamin No. 53, Palu, Sulawesi Tengah, Indonesia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-400">(0451) 422 364</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-400">info@tamannasionallorelindu.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-slate-900 bg-black/50 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} Balai Besar Taman Nasional Lore Lindu. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4">
            <span>Dikembangkan dengan ❤️ di Sulawesi Tengah</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
