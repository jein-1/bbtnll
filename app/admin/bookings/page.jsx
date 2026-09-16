'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Ticket, Eye, Edit, Trash2, Search, RotateCcw, Download,
  CheckCircle, XCircle, Clock, CalendarCheck, Users, DollarSign,
  ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID').format(n || 0)
const fmtCurrency = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',    cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',  icon: Clock         },
  paid:      { label: 'Paid',       cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   icon: CheckCircle   },
  confirmed: { label: 'Confirmed',  cls: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500', icon: CheckCircle   },
  used:      { label: 'Used',       cls: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400',   icon: Ticket        },
  cancelled: { label: 'Cancelled',  cls: 'bg-red-100 text-red-700',       dot: 'bg-red-500',    icon: XCircle       },
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [bookings, setBookings] = useState({ data: [], total: 0 })
  const [destinations, setDestinations] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [destination, setDestination] = useState(searchParams.get('destination_id') || '')
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '', loading: false })
  const [toast, setToast] = useState(null)
  const searchDebounce = useRef(null)

  const page = Number(searchParams.get('page') || 1)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const q = new URLSearchParams()
      searchParams.forEach((v, k) => q.set(k, v))
      const res = await fetch(`/api/admin/bookings?${q}`)
      if (!res.ok) throw new Error('Gagal memuat data booking')
      const data = await res.json()
      setBookings(data.bookings ?? { data: [], total: 0 })
      setDestinations(data.destinations ?? [])
      setStats(data.stats ?? { total: 0, pending: 0, revenue: 0, cancelled: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])

  const applyFilters = useCallback(() => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    if (destination) q.set('destination_id', destination)
    router.push(`/admin/bookings?${q}`)
  }, [search, status, destination, router])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => applyFilters(), 400)
  }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    setDeleteConfirm(d => ({ ...d, loading: true }))
    try {
      await fetch(`/api/admin/bookings/${deleteConfirm.id}`, { method: 'DELETE' })
      showToast('Booking berhasil dihapus', 'deleted')
      setDeleteConfirm({ show: false, id: null, name: '', loading: false })
      await fetchData()
    } catch {
      showToast('Gagal menghapus booking', 'error')
      setDeleteConfirm(d => ({ ...d, loading: false }))
    }
  }

  const destOptions = [{ value: '', label: 'Semua Destinasi' }, ...destinations.map(d => ({ value: d.id, label: d.name }))]

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm({ show: false, id: null, name: '', loading: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-center text-sm font-bold mb-1">Hapus Booking</h3>
            <p className="text-center text-xs text-gray-500 mb-5">Hapus booking <strong>#{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ show: false, id: null, name: '', loading: false })} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={deleteConfirm.loading} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl disabled:opacity-60 transition-colors">
                {deleteConfirm.loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 animate-page">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <CalendarCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">Manajemen Pemesanan</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{fmt(stats.total)} Total</span>
                </div>
                <p className="text-blue-100/80 text-xs">Kelola semua pemesanan tiket wisata</p>
              </div>
            </div>
            <button onClick={() => window.open('/api/admin/bookings/export', '_blank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 text-xs font-bold hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Download className="w-4 h-4" />Export
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Booking', value: fmt(stats.total), icon: Ticket, from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/30' },
            { label: 'Pending', value: fmt(stats.pending), icon: Clock, from: 'from-amber-500', to: 'to-orange-600', shadow: 'shadow-amber-500/30' },
            { label: 'Total Pendapatan', value: fmtCurrency(stats.revenue), icon: DollarSign, from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
            { label: 'Dibatalkan', value: fmt(stats.cancelled), icon: XCircle, from: 'from-red-500', to: 'to-rose-600', shadow: 'shadow-red-500/30' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="relative flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${s.from} ${s.to} shadow-lg ${s.shadow} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    {loading ? <Skeleton className="h-6 w-16 mb-1" /> : <p className="text-base font-black text-gray-900 leading-tight">{s.value}</p>}
                    <p className="text-[10px] text-gray-500 font-medium">{s.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Filters ── */}
        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-50 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari booking, nama pemesan..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all" />
            </div>
            <select value={destination} onChange={e => { setDestination(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-blue-400 transition-all text-gray-700">
              {destOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={status} onChange={e => { setStatus(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-blue-400 transition-all text-gray-700">
              <option value="">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(search || status || destination) && (
              <button onClick={() => { setSearch(''); setStatus(''); setDestination(''); router.push('/admin/bookings') }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
            <p className="text-sm font-bold text-gray-900 mb-1">Gagal memuat booking</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Coba lagi
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">No. Booking</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">Pemesan</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Destinasi</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Tgl Kunjungan</th>
                    <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Total</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  )) : bookings.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <CalendarCheck className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">Belum ada pemesanan</p>
                      </td>
                    </tr>
                  ) : bookings.data?.map(booking => {
                    const sc = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
                    return (
                      <tr key={booking.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-blue-600 font-mono">#{booking.orderNumber || booking.order_number || booking.id}</p>
                          <p className="text-[10px] text-gray-400">{fmtDate(booking.createdAt || booking.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-gray-800">{booking.user?.name || booking.userName || '-'}</p>
                          <p className="text-[10px] text-gray-400">{booking.user?.email || booking.userEmail || ''}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                          {booking.destination?.name || booking.destination || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">
                          {fmtDate(booking.visitDate || booking.visit_date)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right hidden sm:table-cell">
                          {fmtCurrency(booking.totalPrice || booking.total_price)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/bookings/${booking.id}`} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></Link>
                            <Link href={`/admin/bookings/${booking.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                            <button onClick={() => setDeleteConfirm({ show: true, id: booking.id, name: booking.orderNumber || booking.order_number || booking.id, loading: false })}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!error && bookings.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">{bookings.from}–{bookings.to} dari {bookings.total} booking</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/bookings?page=${page - 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= bookings.last_page} onClick={() => router.push(`/admin/bookings?page=${page + 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
