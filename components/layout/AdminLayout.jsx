'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, FileText, MapPin, Image, BookOpen, Users, Leaf, Bird,
  Settings, BarChart3, Bell, LogOut, Menu, X, ChevronRight, Search,
  Clock, MessageSquare, ShieldCheck, Database, Megaphone, Star, Ticket,
  Tag, Globe, Activity
} from 'lucide-react'
import Image2 from 'next/image'

// ─── Sidebar Nav Config ───────────────────────────────────────────────────────
const navSections = [
  {
    label: 'Konten',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/articles', label: 'Artikel & Berita', icon: FileText },
      { href: '/admin/destinations', label: 'Destinasi', icon: MapPin },
      { href: '/admin/gallery', label: 'Galeri', icon: Image },
      { href: '/admin/flora', label: 'Flora', icon: Leaf },
      { href: '/admin/fauna', label: 'Fauna', icon: Bird },
    ],
  },
  {
    label: 'Manajemen',
    items: [
      { href: '/admin/bookings', label: 'Pemesanan', icon: Ticket },
      { href: '/admin/users', label: 'Pengguna', icon: Users },
      { href: '/admin/coupons', label: 'Kupon', icon: Tag },
      { href: '/admin/testimonials', label: 'Testimoni', icon: Star },
      { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Bell },
    ],
  },
  {
    label: 'Laporan',
    items: [
      { href: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
      { href: '/admin/activity-logs', label: 'Log Aktivitas', icon: Activity },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { href: '/admin/admins', label: 'Admin', icon: ShieldCheck },
      { href: '/admin/site-info', label: 'Info Situs', icon: Globe },
      { href: '/admin/database', label: 'Database', icon: Database },
    ],
  },
]

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ item, collapsed, onClick }) {
  const pathname = usePathname()
  const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href))
  const Icon = item.icon
  const ref = useRef(null)

  // Scroll active item into view when route changes
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [isActive])

  return (
    <Link
      href={item.href}
      ref={ref}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium
        transition-all duration-150 w-full
        ${isActive
          ? 'bg-primary-600/25 text-white'
          : 'text-[#9db5aa] hover:bg-white/6 hover:text-white'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary-400" />}
    </Link>
  )
}

// ─── SidebarSection ───────────────────────────────────────────────────────────
function SidebarSection({ section, collapsed }) {
  return (
    <div className="mb-1">
      {!collapsed && (
        <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#5a7a6e]">
          {section.label}
        </p>
      )}
      <div className="space-y-0.5">
        {section.items.map(item => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  )
}

// ─── AdminLayout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Check mobile
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024
    setIsMobile(mobile)
    if (mobile) setSidebarOpen(false)
    else setSidebarOpen(true)
  }, [])

  // Keyboard shortcut Ctrl+K
  const handleKeydown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(s => !s)
    }
    if (e.key === 'Escape') setSearchOpen(false)
  }, [])

  // Time
  const updateTime = useCallback(() => {
    setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
  }, [])

  useEffect(() => {
    const init = () => { checkMobile(); updateTime() }
    init()
    window.addEventListener('resize', checkMobile)
    window.addEventListener('keydown', handleKeydown)
    const timeInterval = setInterval(updateTime, 60000)
    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('keydown', handleKeydown)
      clearInterval(timeInterval)
    }
  }, [checkMobile, handleKeydown, updateTime])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const close = () => { if (isMobile) setSidebarOpen(false) }
    close()
  }, [pathname]) // eslint-disable-line

  const toggleSidebar = () => {
    if (isMobile) setSidebarOpen(s => !s)
    else setSidebarCollapsed(s => !s)
  }

  const sidebarWidth = isMobile ? 'w-[280px]' : sidebarCollapsed ? 'w-[70px]' : 'w-[260px]'
  const mainMargin = isMobile ? '' : sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[260px]'

  const adminName = session?.user?.name ?? 'Admin'
  const adminRole = session?.user?.role ?? 'admin'
  const adminInitial = adminName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#f6f8f6]">
      <a href="#main-content" className="skip-to-content">Langsung ke konten utama</a>

      <div className="flex min-h-screen w-full">
        {/* ── Sidebar Overlay (mobile) ── */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        {(!isMobile || sidebarOpen) && (
          <aside
            aria-label="Sidebar admin"
            className={`
              fixed inset-y-0 left-0 z-50 flex flex-col
              bg-[#071b17] border-r border-[#1d4335]
              ${sidebarWidth} transition-[width] duration-200 ease-out
            `}
          >
            {/* Logo */}
            <div className="h-16 px-3 flex items-center justify-between border-b border-[#1d4335] shrink-0">
              {!sidebarCollapsed || isMobile ? (
                <button
                  onClick={() => { if (!isMobile) setSidebarCollapsed(true) }}
                  className="flex items-center gap-2.5 text-left cursor-pointer w-full"
                  title="Ciutkan Sidebar"
                >
                  <Image2
                    src="/tnll-logo.png"
                    alt="TNLL"
                    width={36} height={36}
                    className="rounded-xl bg-[#0c211b] p-1 object-contain ring-1 ring-[#1d4335] shrink-0"
                  />
                  <div>
                    <span className="text-sm font-bold text-white">TNLL </span>
                    <span className="text-sm font-semibold text-[#9db5aa]">Admin</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="w-full flex justify-center cursor-pointer"
                  title="Perluas Sidebar"
                >
                  <Image2
                    src="/tnll-logo.png"
                    alt="TNLL"
                    width={36} height={36}
                    className="rounded-xl bg-[#0c211b] p-1 object-contain ring-1 ring-[#1d4335]"
                  />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav
              aria-label="Menu admin"
              className="flex-1 px-2 py-3 space-y-4 overflow-y-auto sidebar-scroll"
            >
              {navSections.map(section => (
                <SidebarSection
                  key={section.label}
                  section={section}
                  collapsed={sidebarCollapsed && !isMobile}
                />
              ))}
            </nav>

            {/* Footer */}
            {(!sidebarCollapsed || isMobile) && (
              <div className="px-3 py-2.5 border-t border-[#1d4335] shrink-0">
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#9db5aa]">
                  <Clock className="w-3 h-3" />
                  <span>{currentTime}</span>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* ── Main Content ── */}
        <main
          id="main-content"
          className={`flex-1 min-h-screen overflow-x-hidden transition-[margin] duration-200 ease-out ${mainMargin}`}
        >
          {/* ── Top Header ── */}
          <header className="sticky top-0 z-30 bg-[#f6f8f6]/95 backdrop-blur-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 lg:px-6">
              {/* Left */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Mobile Logo */}
                {isMobile && (
                  <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <Image2 src="/tnll-logo.png" alt="TNLL" width={32} height={32}
                      className="rounded-lg bg-[#071b17] p-1 object-contain ring-1 ring-[#1d4335]" />
                    <span className="text-sm font-bold text-gray-800">TNLL Admin</span>
                  </Link>
                )}

                {/* Menu Toggle */}
                <button
                  onClick={toggleSidebar}
                  aria-label="Toggle sidebar"
                  className="p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  {isMobile && sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {/* Search */}
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Pencarian global"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="hidden sm:inline text-xs text-gray-500">Cari...</span>
                  <span className="hidden md:flex text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded ml-2 sm:ml-6">
                    Ctrl+K
                  </span>
                </button>
              </div>

              {/* Right — Admin Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <button
                  aria-label="Notifikasi"
                  className="relative p-2 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200" />

                {/* Admin Profile */}
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-gray-800 leading-none">{adminName}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 capitalize">{adminRole.replace('_', ' ')}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {adminInitial}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  aria-label="Keluar"
                  className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* ── Page Content ── */}
          <div className={`p-3 sm:p-4 lg:p-6 overflow-x-hidden max-w-full animate-page ${isMobile ? 'pb-6' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* ── Global Search Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh] px-4" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Cari halaman, artikel, pengguna..."
                className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
              <button onClick={() => setSearchOpen(false)} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded">ESC</button>
            </div>
            <div className="p-4 text-center text-sm text-gray-400">Ketik untuk mencari...</div>
          </div>
        </div>
      )}
    </div>
  )
}
