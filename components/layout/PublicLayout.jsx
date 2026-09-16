import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Layout untuk semua halaman publik (/, /berita, /destinasi, /galeri, /tentang)
export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f6f8f6] flex flex-col">
      <a href="#main-content" className="skip-to-content">Langsung ke konten utama</a>
      <Header />
      <main id="main-content" className="grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
