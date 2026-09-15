'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, LayoutDashboard, Ticket, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navigation = [
  { name: 'Beranda', href: '/' },
  { name: 'Destinasi', href: '/destinasi' },
  { name: 'Berita', href: '/berita' },
  { name: 'Galeri', href: '/galeri' },
  { name: 'Tentang', href: '/tentang' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isHome = pathname === '/'
  const headerClasses = `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
    isScrolled || !isHome
      ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm py-3'
      : 'bg-transparent py-5'
  }`

  const linkClasses = (href) => {
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
    const base = 'text-sm font-medium transition-colors hover:text-emerald-500'
    
    if (isActive) return `${base} text-emerald-600 dark:text-emerald-400`
    
    // If on home page and not scrolled, links should be white for contrast against hero image
    if (isHome && !isScrolled) return `${base} text-white/90 hover:text-white`
    
    return `${base} text-slate-700 dark:text-slate-300`
  }

  return (
    <header className={headerClasses}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-xl leading-none">T</span>
            </div>
            <span className={`text-xl font-bold tracking-tight ${isHome && !isScrolled ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              TNLL Explore
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className={linkClasses(item.href)}>
              {item.name}
            </Link>
          ))}
        </div>

        {/* User / Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-10 w-10 rounded-full ${isHome && !isScrolled ? 'hover:bg-white/20' : ''}`}>
                  <Avatar className="h-10 w-10 border-2 border-emerald-500/20">
                    <AvatarImage src={session.user?.image} alt={session.user?.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">{session.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer flex items-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="cursor-pointer flex items-center">
                    <Ticket className="mr-2 h-4 w-4" />
                    <span>Tiket Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist" className="cursor-pointer flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className={isHome && !isScrolled ? 'text-white hover:bg-white/20 hover:text-white' : ''}>
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md shadow-emerald-500/20">
                  Daftar
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md ${isHome && !isScrolled ? 'text-white' : 'text-slate-900 dark:text-white'}`}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-base font-medium ${
                pathname === item.href ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-2"></div>
          {session ? (
            <div className="flex flex-col gap-2">
              <div className="px-4 py-2 flex items-center gap-3">
                 <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">{session.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{session.user?.name}</p>
                    <p className="text-sm text-slate-500">{session.user?.email}</p>
                  </div>
              </div>
              <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </Link>
              <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 text-red-600 text-left">
                <LogOut className="h-5 w-5" /> Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-4 pt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
