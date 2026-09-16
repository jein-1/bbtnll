'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  LayoutDashboard, CalendarCheck, Clock, Users, MapPin, Leaf, Bird,
  Image, FileText, Mail, MessageSquare, RefreshCw, Wallet,
  TrendingUp, AlertCircle, CheckCircle2, XCircle, Calendar,
  ChevronDown, Check, BarChart3, PieChart, Activity, ArrowUpRight, Ticket
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('id-ID').format(n || 0)
const fmtCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'  },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500'   },
  used:      { label: 'Selesai',    color: 'bg-green-100 text-green-700',   dot: 'bg-green-500'  },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700',       dot: 'bg-red-500'    },
}

const PERIODS = [
  { label: 'Hari Ini',         value: 'today'      },
  { label: '7 Hari Terakhir',  value: '7days'      },
  { label: '30 Hari Terakhir', value: '30days'     },
  { label: 'Bulan Ini',        value: 'this_month' },
  { label: 'Bulan Lalu',       value: 'last_month' },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, subLabel, subValue, icon: Icon, loading, href, linkText, accent = false }) {
  return (
    <div className={`bg-white rounded-xl border ${accent ? 'border-amber-200 bg-amber-50' : 'border-gray-100'} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-7 w-20 mt-3" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
      ) : (
        <>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-amber-500' : 'bg-primary-600'}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{title}</p>
          {subLabel && (
            <p className="text-[11px] text-gray-400 mt-1">{subLabel}: <span className="font-semibold text-gray-600">{subValue}</span></p>
          )}
          {href && (
            <Link href={href} className="inline-flex items-center gap-1 text-[11px] text-primary-600 font-semibold mt-2 hover:underline">
              {linkText} <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </>
      )}
    </div>
  )
}

// ─── Mini Bar Chart (Canvas) ──────────────────────────────────────────────────
function MiniBarChart({ labels = [], data = [] }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data.length) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth, H = canvas.offsetHeight
    canvas.width = W; canvas.height = H
    ctx.clearRect(0, 0, W, H)
    const max = Math.max(...data, 1)
    const barW = (W / data.length) * 0.6
    const gap = W / data.length
    data.forEach((val, i) => {
      const barH = (val / max) * (H - 24)
      const x = gap * i + (gap - barW) / 2
      const y = H - barH - 16
      const grad = ctx.createLinearGradient(0, y, 0, H - 16)
      grad.addColorStop(0, 'rgba(44,138,99,0.9)')
      grad.addColorStop(1, 'rgba(21,122,87,0.55)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, barW, barH, 4)
      ctx.fill()
      if (i % Math.ceil(data.length / 7) === 0 || data.length <= 7) {
        ctx.fillStyle = '#94a3b8'
        ctx.font = '9px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i]?.split(' ')[0] ?? '', x + barW / 2, H - 2)
      }
    })
  }, [data, labels])
  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: 'block' }} />
}

// ─── Donut Chart (Canvas) ─────────────────────────────────────────────────────
function DonutChart({ values = [0, 0, 0, 0], colors = ['#1d64b8', '#a05f00', '#1e7d46', '#c0322b'] }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const size = 120
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, size, size)
    const total = values.reduce((a, b) => a + b, 0)
    if (!total) {
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2)
      ctx.strokeStyle = '#f1f5f9'
      ctx.lineWidth = 16
      ctx.stroke()
      return
    }
    let angle = -Math.PI / 2
    values.forEach((val, i) => {
      const slice = (val / total) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(size / 2, size / 2)
      ctx.arc(size / 2, size / 2, size / 2 - 8, angle, angle + slice)
      ctx.closePath()
      ctx.fillStyle = colors[i]
      ctx.fill()
      angle += slice
    })
    // Donut hole
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 24, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }, [values, colors])
  return <canvas ref={canvasRef} style={{ width: 120, height: 120 }} />
}

// ─── WelcomeHeader ────────────────────────────────────────────────────────────
function WelcomeHeader({ periodLabel, stats, loading, refreshing, onPeriodChange, onRefresh }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  return (
    <div className="relative rounded-2xl bg-primary-600 p-5 shadow-lg mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Dashboard Admin</h1>
            <p className="text-green-100/80 text-xs">TNLL Explore Management System</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(s => !s)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/25 text-white hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">{periodLabel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Periode</p>
                    <div className="space-y-1">
                      {PERIODS.map(p => (
                        <button key={p.value} onClick={() => { onPeriodChange(p.value); setShowDropdown(false) }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${periodLabel === p.label ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {p.label}
                          {periodLabel === p.label && <Check className="w-4 h-4 text-primary-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rentang Kustom</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="text-[10px] text-gray-500 mb-1 block">Dari</label>
                        <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-600" />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 mb-1 block">Sampai</label>
                        <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-600" />
                      </div>
                    </div>
                    <button
                      onClick={() => { if (customStart && customEnd) { onPeriodChange('custom', customStart, customEnd); setShowDropdown(false) } }}
                      disabled={!customStart || !customEnd}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors">
                      Terapkan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Refresh */}
          <button onClick={onRefresh} disabled={refreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25 text-white hover:bg-white/20 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Quick stats */}
          <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/20">
            <div className="text-center">
              {loading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : <p className="text-xl font-black text-white leading-none">{fmt(stats?.periodBookings)}</p>}
              <p className="text-[10px] text-green-100/70 font-medium mt-0.5">Booking</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              {loading ? <Skeleton className="h-6 w-8 mx-auto mb-1" /> : <p className="text-xl font-black text-amber-300 leading-none">{fmt(stats?.pendingBookings)}</p>}
              <p className="text-[10px] text-green-100/70 font-medium mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('7days')

  const fetchData = useCallback(async (p = period, customStart, customEnd, isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      let url = `/api/admin/dashboard?period=${p}`
      if (p === 'custom' && customStart && customEnd) url += `&start_date=${customStart}&end_date=${customEnd}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal memuat data dashboard')
      setData(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, []) // eslint-disable-line

  const handlePeriodChange = (p, s, e) => {
    setPeriod(p)
    fetchData(p, s, e, true)
  }

  const stats = data?.stats ?? {}
  const contentStats = data?.contentStats ?? {}
  const bookingStatus = data?.bookingStatus ?? {}
  const recentBookings = data?.recentBookings ?? []
  const labels = data?.labels ?? []
  const bookingData = data?.bookingData ?? []
  const periodLabel = data?.periodLabel ?? '7 Hari Terakhir'

  const primaryStats = [
    { title: 'Pendapatan Periode', value: fmtCurrency(stats.periodRevenue), subLabel: 'Total', subValue: fmtCurrency(stats.totalRevenue), icon: Wallet },
    { title: 'Pemesanan Periode', value: fmt(stats.periodBookings), subLabel: 'Total', subValue: fmt(stats.totalBookings), icon: CalendarCheck },
    { title: 'Menunggu Approval', value: fmt(stats.pendingBookings), icon: Clock, href: '/admin/bookings?status=pending', linkText: 'Lihat semua', accent: true },
    { title: 'Total Pengguna', value: fmt(stats.totalUsers), subLabel: 'Baru bulan ini', subValue: fmt(stats.newUsersThisMonth), icon: Users },
  ]

  const contentItems = [
    { title: 'Destinasi', value: contentStats.destinations ?? 0, icon: MapPin },
    { title: 'Flora', value: contentStats.flora ?? 0, icon: Leaf },
    { title: 'Fauna', value: contentStats.fauna ?? 0, icon: Bird },
    { title: 'Galeri', value: contentStats.gallery ?? 0, icon: Image },
    { title: 'Artikel', value: contentStats.articles ?? 0, icon: FileText },
    { title: 'Newsletter', value: contentStats.subscribers ?? 0, icon: Mail },
    { title: 'Testimoni', value: contentStats.testimonials ?? 0, icon: MessageSquare },
  ]

  const statusItems = [
    { label: 'Selesai',      value: bookingStatus.used ?? 0,      color: '#1d64b8' },
    { label: 'Pending',      value: bookingStatus.pending ?? 0,    color: '#a05f00' },
    { label: 'Dikonfirmasi', value: bookingStatus.confirmed ?? 0,  color: '#1e7d46' },
    { label: 'Dibatalkan',   value: bookingStatus.cancelled ?? 0,  color: '#c0322b' },
  ]
  const totalStatus = statusItems.reduce((a, b) => a + b.value, 0)

  if (error) return (
    <AdminLayout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">Terjadi Kesalahan</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={() => fetchData()} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="space-y-4 animate-page">

        {/* Welcome Header */}
        <WelcomeHeader
          periodLabel={periodLabel}
          stats={stats}
          loading={loading}
          refreshing={refreshing}
          onPeriodChange={handlePeriodChange}
          onRefresh={() => fetchData(period, undefined, undefined, true)}
        />

        {/* Primary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {primaryStats.map((s, i) => (
            <StatCard key={i} loading={loading} {...s} />
          ))}
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {loading ? Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-white border border-gray-100">
              <Skeleton className="w-9 h-9 rounded-xl mx-auto mb-2" />
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          )) : contentItems.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="group p-3 rounded-xl bg-white border border-gray-100 hover:shadow-lg hover:border-primary-600/30 transition-all text-center cursor-default">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 bg-primary-50 group-hover:bg-primary-100 transition-colors">
                  <Icon className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-lg font-bold text-gray-900">{fmt(item.value)}</p>
                <p className="text-[10px] text-gray-500 font-medium">{item.title}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Aksi Cepat</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: '/admin/articles/create', label: '+ Artikel Baru', color: 'bg-primary-50 text-primary-600 hover:bg-[#dcf2e6]' },
              { href: '/admin/destinations/create', label: '+ Destinasi Baru', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { href: '/admin/gallery/upload', label: '+ Upload Galeri', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { href: '/admin/bookings?status=pending', label: 'Booking Pending', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              { href: '/admin/users', label: 'Kelola Pengguna', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${a.color}`}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Statistik Booking</h3>
                  <p className="text-[10px] text-gray-500">{periodLabel}</p>
                </div>
              </div>
              <div className="text-right">
                {loading ? <Skeleton className="h-6 w-12" /> : <p className="text-xl font-black text-primary-600">{fmt(stats.periodBookings)}</p>}
                <p className="text-[10px] text-gray-500">booking</p>
              </div>
            </div>
            <div className="flex-1 p-4 min-h-0">
              {loading ? <Skeleton className="h-40 w-full" /> : (
                <div className="h-40">
                  <MiniBarChart labels={labels} data={bookingData} />
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Status Booking</h3>
                <p className="text-[10px] text-gray-500">{periodLabel}</p>
              </div>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center gap-8">
              {loading ? <Skeleton className="h-30 w-30 rounded-full" /> : (
                <>
                  <div className="relative shrink-0">
                    <DonutChart values={statusItems.map(s => s.value)} colors={statusItems.map(s => s.color)} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-black text-gray-900">{fmt(totalStatus)}</p>
                      <p className="text-[10px] text-gray-500">Total</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {statusItems.map(item => (
                      <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{fmt(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pemesanan Terbaru</h3>
                <p className="text-[10px] text-gray-500">5 pemesanan terkini</p>
              </div>
            </div>
            <Link href="/admin/bookings" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pengguna</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destinasi</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Tanggal</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                )) : recentBookings.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-gray-400">Belum ada pemesanan</td></tr>
                ) : recentBookings.map(b => {
                  const sc = STATUS_CONFIG[b.status] ?? { label: b.status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
                  return (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 text-xs">{b.userName}</p>
                        <p className="text-[10px] text-gray-400">{b.userEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{b.destination}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{fmtDate(b.visitDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 text-right hidden sm:table-cell">{fmtCurrency(b.totalPrice)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
