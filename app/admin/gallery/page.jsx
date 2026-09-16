'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Image, Plus, Eye, Edit, Trash2, Search, RotateCcw,
  CheckCircle, XCircle, Star, ChevronLeft, ChevronRight, Grid3X3, List
} from 'lucide-react'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [toast, setToast] = useState(null)
  const debounce = useRef(null)
  const page = Number(searchParams.get('page') || 1)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const q = new URLSearchParams(); searchParams.forEach((v, k) => q.set(k, v))
      const res = await fetch(`/api/admin/gallery?${q}`)
      if (!res.ok) throw new Error('Gagal memuat galeri')
      const data = await res.json()
      setItems(data.gallery ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { clearTimeout(debounce.current); debounce.current = setTimeout(() => router.push(`/admin/gallery?search=${search}`), 400) }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    try {
      await fetch(`/api/admin/gallery/${deleteConfirm.id}`, { method: 'DELETE' })
      showToast('Foto berhasil dihapus', 'deleted'); setDeleteConfirm(null); await fetchData()
    } catch { showToast('Gagal menghapus', 'error') }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      {deleteConfirm && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-center text-sm font-bold mb-1">Hapus Foto</h3>
            <p className="text-center text-xs text-gray-500 mb-5">Hapus foto ini secara permanen?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-600 via-violet-600 to-fuchsia-600 p-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <Image className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight">Galeri Foto</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Foto</span>
                </div>
                <p className="text-purple-100/80 text-xs">Kelola semua foto dan gambar TNLL</p>
              </div>
            </div>
            <Link href="/admin/gallery/upload"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-600 text-xs font-bold hover:bg-purple-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />Upload Foto
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-50 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari foto..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all" />
          </div>
          {search && (
            <button onClick={() => { setSearch(''); router.push('/admin/gallery') }}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 text-xs rounded-xl hover:bg-gray-200 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" />Reset
            </button>
          )}
          <div className="flex gap-1 border border-gray-200 rounded-xl p-1 ml-auto">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}><Grid3X3 className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center shadow-lg">
            <XCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
            <p className="text-sm font-bold text-gray-900 mb-1">Gagal memuat galeri</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" />Coba lagi
            </button>
          </div>
        )}

        {/* Grid View */}
        {!error && !loading && viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {items.data?.map(item => (
              <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img src={item.imageUrl || item.image_url || '/images/placeholder.svg'} alt={item.title || item.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => e.target.src = '/images/placeholder.svg'} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.title || item.caption || 'Tanpa judul'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.category || 'Umum'}</p>
                  <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-gray-100">
                    <Link href={`/admin/gallery/${item.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => setDeleteConfirm(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {!items.data?.length && (
              <div className="col-span-full py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-4">Belum ada foto</p>
                <Link href="/admin/gallery/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors">
                  <Plus className="w-4 h-4" />Upload Foto
                </Link>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {!error && !loading && viewMode === 'list' && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Foto</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Kategori</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.data?.map(item => (
                  <tr key={item.id} className="group hover:bg-purple-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl || item.image_url || '/images/placeholder.svg'} alt=""
                          className="w-16 h-12 rounded-lg object-cover" onError={e => e.target.src = '/images/placeholder.svg'} />
                        <p className="text-xs font-semibold text-gray-800">{item.title || item.caption || 'Tanpa judul'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{item.category || 'Umum'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/gallery/${item.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => setDeleteConfirm(item)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!error && items.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">{items.from}–{items.to} dari {items.total} foto</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/gallery?page=${page - 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= items.last_page} onClick={() => router.push(`/admin/gallery?page=${page + 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
