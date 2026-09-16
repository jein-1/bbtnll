'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  MapPin, Plus, Eye, Edit, Trash2, Star, CheckCircle,
  XCircle, Search, RotateCcw, Copy, ChevronLeft, ChevronRight
} from 'lucide-react'

const fmt = n => new Intl.NumberFormat('id-ID').format(n || 0)
const fmtCurrency = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

function ConfirmDialog({ show, title, message, onConfirm, onClose, loading }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-center text-sm font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-center text-xs text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60">
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDestinationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [destinations, setDestinations] = useState({ data: [], total: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [sortPrice, setSortPrice] = useState(searchParams.get('sort_price') || '')
  const [featured, setFeatured] = useState(searchParams.get('featured') || '')
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
      const res = await fetch(`/api/admin/destinations?${q}`)
      if (!res.ok) throw new Error('Gagal memuat data destinasi')
      const data = await res.json()
      setDestinations(data.destinations ?? { data: [], total: 0 })
      setCategories(data.categories ?? [])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])

  const applyFilters = useCallback(() => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    if (sortPrice) q.set('sort_price', sortPrice)
    if (featured) q.set('featured', featured)
    router.push(`/admin/destinations?${q}`)
  }, [search, status, sortPrice, featured, router])

  useEffect(() => { const init = async () => { await fetchData() }; init() }, [fetchData])

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => applyFilters(), 400)
  }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    const { id, name } = deleteConfirm
    setDeleteConfirm(d => ({ ...d, loading: true }))
    try {
      const res = await fetch(`/api/admin/destinations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('Destinasi berhasil dihapus', 'deleted')
      setDeleteConfirm({ show: false, id: null, name: '', loading: false })
      await fetchData()
    } catch {
      showToast('Gagal menghapus destinasi', 'error')
      setDeleteConfirm(d => ({ ...d, loading: false }))
    }
  }

  const toggleActive = async (dest) => {
    await fetch(`/api/admin/destinations/${dest.id}/toggle-active`, { method: 'POST' })
    showToast(dest.isActive || dest.is_active ? 'Destinasi dinonaktifkan' : 'Destinasi diaktifkan')
    await fetchData()
  }

  const toggleFeatured = async (dest) => {
    await fetch(`/api/admin/destinations/${dest.id}/toggle-featured`, { method: 'POST' })
    showToast(dest.isFeatured || dest.is_featured ? 'Dihapus dari unggulan' : 'Ditambahkan ke unggulan')
    await fetchData()
  }

  const stats = {
    total: destinations.total || 0,
    active: destinations.data?.filter(d => d.isActive || d.is_active).length || 0,
    featured: destinations.data?.filter(d => d.isFeatured || d.is_featured).length || 0,
  }

  const catOptions = [{ value: '', label: 'Semua kategori' }, ...categories.map(c => ({ value: c.id, label: c.name }))]

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="Hapus Destinasi"
        message={`Hapus "${deleteConfirm.name}" secara permanen? Semua data terkait akan ikut terhapus.`}
        onConfirm={handleDelete} onClose={() => setDeleteConfirm({ show: false, id: null, name: '', loading: false })}
        loading={deleteConfirm.loading}
      />

      <div className="space-y-4 animate-page">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-600 via-teal-600 to-green-600 p-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">Destinasi Wisata</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{stats.total} Total</span>
                </div>
                <p className="text-emerald-100/80 text-xs">Kelola semua destinasi wisata Taman Nasional Lore Lindu</p>
              </div>
            </div>
            <Link href="/admin/destinations/create"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 text-xs font-bold hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Tambah Destinasi
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Total Destinasi', value: stats.total, icon: MapPin, from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
            { label: 'Destinasi Aktif', value: stats.active, icon: CheckCircle, from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/30' },
            { label: 'Unggulan', value: stats.featured, icon: Star, from: 'from-amber-500', to: 'to-yellow-600', shadow: 'shadow-amber-500/30', span: 'col-span-2 lg:col-span-1' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all ${s.span || ''}`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
                <div className="relative flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${s.from} ${s.to} shadow-lg ${s.shadow} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    {loading ? <Skeleton className="h-6 w-10 mb-1" /> : <p className="text-xl font-black text-gray-900">{s.value}</p>}
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari destinasi berdasarkan nama atau kota..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 focus:bg-white transition-all" />
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-400 transition-all text-gray-700">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <select value={sortPrice} onChange={e => { setSortPrice(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-400 transition-all text-gray-700">
              <option value="">Urutkan Harga</option>
              <option value="low">Harga Terendah</option>
              <option value="high">Harga Tertinggi</option>
            </select>
            <select value={featured} onChange={e => { setFeatured(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-400 transition-all text-gray-700">
              <option value="">Semua Destinasi</option>
              <option value="yes">Unggulan</option>
              <option value="no">Non-unggulan</option>
            </select>
            {(search || status || sortPrice || featured) && (
              <button onClick={() => { setSearch(''); setStatus(''); setSortPrice(''); setFeatured(''); router.push('/admin/destinations') }}
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
            <p className="text-sm font-bold text-gray-900 mb-1">Gagal memuat destinasi</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Coba lagi
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700">Daftar Destinasi</p>
              {destinations.total > 0 && <p className="text-[10px] text-gray-500">{destinations.total} destinasi</p>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Destinasi</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Lokasi</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Harga</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unggulan</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  )) : destinations.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                            <MapPin className="w-7 h-7 text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-600 mb-1">Belum Ada Destinasi</p>
                          <p className="text-xs text-gray-400 mb-4">Mulai tambahkan destinasi wisata pertama</p>
                          <Link href="/admin/destinations/create" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
                            <Plus className="w-4 h-4" />Tambah Destinasi
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : destinations.data?.map(dest => {
                    const isActive = dest.isActive || dest.is_active
                    const isFeatured = dest.isFeatured || dest.is_featured
                    return (
                      <tr key={dest.id} className="group hover:bg-emerald-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img src={dest.coverUrl || dest.cover_url || '/images/placeholder.svg'} alt={dest.name}
                                className="w-20 aspect-video rounded-lg object-cover border border-gray-100" width={80}
                                onError={e => e.target.src = '/images/placeholder.svg'} />
                              {(dest.images?.length > 1) && (
                                <span className="absolute -bottom-1 -right-1 min-w-4 h-4 px-1 rounded bg-primary-600 text-[8px] font-bold text-white flex items-center justify-center">
                                  {dest.images.length - 1}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{dest.name}</p>
                              <p className="text-[10px] text-gray-500">{dest.category?.name || 'Umum'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {dest.city}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-gray-900 hidden lg:table-cell">
                          {dest.formattedAdultPrice || dest.formatted_adult_price || fmtCurrency(dest.adultPrice || dest.adult_price)}
                        </td>
                        <td className="px-4 py-3 text-center hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-bold text-gray-900">{dest.rating || '0.0'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleActive(dest)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleFeatured(dest)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-colors ${isFeatured ? 'bg-amber-100 text-amber-500' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-400'}`}>
                            <Star className={`w-4 h-4 ${isFeatured ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-0.5">
                            <Link href={`/admin/destinations/${dest.id}`} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></Link>
                            <Link href={`/admin/destinations/${dest.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                            <button onClick={() => setDeleteConfirm({ show: true, id: dest.id, name: dest.name, loading: false })}
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
        {!error && destinations.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">Hal {page} dari {destinations.last_page} ({destinations.total} destinasi)</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/destinations?page=${page - 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= destinations.last_page} onClick={() => router.push(`/admin/destinations?page=${page + 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
