'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  FileText, Plus, Eye, Edit, Trash2, RotateCcw, Star,
  CheckCircle, XCircle, Grid3X3, List, Search, Sparkles,
  Clock, ChevronLeft, ChevronRight
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

const STATUS_CONFIG = {
  published: { label: 'Published', cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600',       dot: 'bg-gray-400'    },
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}

function DeleteModal({ show, name, onConfirm, onClose, loading }) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-center text-sm font-bold text-gray-900 mb-1">Hapus Artikel</h3>
        <p className="text-center text-xs text-gray-500 mb-5">Hapus <strong>&ldquo;{name}&rdquo;</strong>? Tindakan ini tidak dapat dibatalkan.</p>
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

export default function AdminArticlesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [articles, setArticles] = useState({ data: [], total: 0 })
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
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
      if (searchParams.get('search')) q.set('search', searchParams.get('search'))
      if (searchParams.get('status')) q.set('status', searchParams.get('status'))
      if (searchParams.get('category')) q.set('category', searchParams.get('category'))
      if (searchParams.get('page')) q.set('page', searchParams.get('page'))
      const res = await fetch(`/api/admin/articles?${q}`)
      if (!res.ok) throw new Error('Gagal memuat artikel')
      const data = await res.json()
      setArticles(data.articles ?? { data: [], total: 0 })
      setCategories(data.categories ?? {})
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])

  const applyFilters = useCallback((s = search, st = status, cat = category) => {
    const q = new URLSearchParams()
    if (s) q.set('search', s)
    if (st) q.set('status', st)
    if (cat) q.set('category', cat)
    router.push(`/admin/articles?${q}`)
  }, [search, status, category, router])

  // Trigger fetch when searchParams change
  useEffect(() => { fetchData() }, [fetchData])

  // Debounced search
  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => applyFilters(search, status, category), 400)
  }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('Artikel berhasil dihapus', 'deleted')
      await fetchData()
    } catch { showToast('Gagal menghapus artikel', 'error') }
    finally { setDeleteLoading(false); setDeleteTarget(null) }
  }

  const stats = {
    total: articles.total || 0,
    published: articles.data?.filter(a => a.isPublished || a.is_published).length || 0,
    featured: articles.data?.filter(a => a.isFeatured || a.is_featured).length || 0,
  }

  const catOptions = [{ value: '', label: 'Semua Kategori' }, ...Object.entries(categories).map(([k, v]) => ({ value: k, label: v }))]

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'deleted' ? 'bg-orange-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <DeleteModal show={!!deleteTarget} name={deleteTarget?.title} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} loading={deleteLoading} />

      <div className="space-y-4 animate-page">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-rose-500 via-pink-500 to-fuchsia-500 p-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">Manajemen Artikel</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90 backdrop-blur-sm">{stats.total} Total</span>
                </div>
                <p className="text-pink-100/80 text-xs">Kelola semua artikel dan konten blog</p>
              </div>
            </div>
            <Link href="/admin/articles/create"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>Tulis Artikel Baru</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Total Artikel', value: stats.total, icon: FileText, from: 'from-rose-500', to: 'to-pink-600', shadow: 'shadow-rose-500/30' },
            { label: 'Terpublikasi', value: stats.published, icon: Eye, from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
            { label: 'Unggulan', value: stats.featured, icon: Star, from: 'from-amber-500', to: 'to-yellow-600', shadow: 'shadow-amber-500/30', span: 'col-span-2 lg:col-span-1' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className={`group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${s.span || ''}`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-linear-to-br from-gray-100 to-gray-200 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
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
            {/* Search */}
            <div className="flex-1 min-w-50 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 focus:bg-white transition-all" />
            </div>
            {/* Category */}
            <select value={category} onChange={e => { setCategory(e.target.value); applyFilters(search, status, e.target.value) }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all text-gray-700">
              {catOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {/* Status */}
            <select value={status} onChange={e => { setStatus(e.target.value); applyFilters(search, e.target.value, category) }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition-all text-gray-700">
              <option value="">Semua Status</option>
              <option value="published">Terpublikasi</option>
              <option value="draft">Draft</option>
            </select>
            {/* Reset */}
            {(search || status || category) && (
              <button onClick={() => { setSearch(''); setStatus(''); setCategory(''); router.push('/admin/articles') }}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium text-xs rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5" />Reset
              </button>
            )}
            {/* View Toggle */}
            <div className="flex gap-1 border border-gray-200 rounded-xl p-1 ml-auto">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid3X3 className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-rose-100 text-rose-600' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
            <p className="text-sm font-bold text-gray-900 mb-1">Gagal memuat artikel</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Coba lagi
            </button>
          </div>
        )}

        {/* ── Grid View ── */}
        {!error && !loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {articles.data?.map(article => (
              <div key={article.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img src={article.imageUrl || article.image_url || '/images/placeholder.svg'} alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => e.target.src = '/images/placeholder.svg'} />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {(article.isFeatured || article.is_featured) && (
                      <span className="px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" />Unggulan
                      </span>
                    )}
                    <StatusBadge status={(article.isPublished || article.is_published) ? 'published' : 'draft'} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-rose-600 font-bold uppercase mb-1">
                    {categories[article.category] || article.category || 'Umum'}
                  </p>
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">{article.title}</h3>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{fmtDate(article.publishedAt || article.published_at)}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                    <Link href={`/admin/articles/${article.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => setDeleteTarget(article)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {!articles.data?.length && (
              <div className="col-span-full py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Tidak ada artikel</p>
                <p className="text-xs text-gray-400 mb-4">Mulai tulis artikel pertama</p>
                <Link href="/admin/articles/create" className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-semibold hover:shadow-lg transition-all">
                  <Plus className="w-4 h-4" />Tulis Artikel
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── List View ── */}
        {!error && !loading && viewMode === 'list' && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">Artikel</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                    <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.data?.map(article => (
                    <tr key={article.id} className="group hover:bg-linear-to-r hover:from-rose-50/50 hover:to-pink-50/30 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={article.imageUrl || article.image_url || '/images/placeholder.svg'} alt=""
                            className="w-16 h-10 rounded-lg object-cover ring-2 ring-gray-100 group-hover:ring-rose-200 transition-all shrink-0"
                            onError={e => e.target.src = '/images/placeholder.svg'} />
                          <div>
                            <p className="text-xs font-bold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">{article.title}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{article.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><span className="text-[10px] font-bold text-rose-600 uppercase">{categories[article.category] || article.category || 'Umum'}</span></td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={(article.isPublished || article.is_published) ? 'published' : 'draft'} /></td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{fmtDate(article.publishedAt || article.published_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/articles/${article.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteTarget(article)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Loading Skeleton ── */}
        {loading && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0">
                <Skeleton className="h-10 w-16 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-20 hidden md:block" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!error && articles.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">
              Menampilkan {articles.from}–{articles.to} dari {articles.total} artikel
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/articles?page=${page - 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700">Hal {page} / {articles.last_page}</span>
              <button disabled={page >= articles.last_page} onClick={() => router.push(`/admin/articles?page=${page + 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
