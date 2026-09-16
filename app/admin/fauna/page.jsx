'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Bird, Plus, Eye, Edit, Trash2, Search, RotateCcw, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }

export default function AdminFaunaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const debounce = useRef(null)
  const page = Number(searchParams.get('page') || 1)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const q = new URLSearchParams(); searchParams.forEach((v, k) => q.set(k, v))
      const res = await fetch(`/api/admin/fauna?${q}`)
      if (!res.ok) throw new Error('Gagal memuat data fauna')
      const data = await res.json()
      setItems(data.fauna ?? data.items ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])
  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { clearTimeout(debounce.current); debounce.current = setTimeout(() => router.push(`/admin/fauna?search=${search}`), 400) }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await fetch(`/api/admin/fauna/${deleteTarget.id}`, { method: 'DELETE' })
      showToast('Fauna berhasil dihapus', 'deleted'); setDeleteTarget(null); await fetchData()
    } catch { showToast('Gagal menghapus', 'error') }
    finally { setDeleteLoading(false) }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      {deleteTarget && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="text-center text-sm font-bold mb-1">Hapus Fauna</h3>
            <p className="text-center text-xs text-gray-500 mb-5">Hapus <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 border border-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 px-4 py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60">
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-amber-600 via-orange-600 to-red-600 p-6 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <Bird className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">Fauna</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total || 0} Data</span>
                </div>
                <p className="text-orange-100/80 text-xs">Kelola data fauna Taman Nasional Lore Lindu</p>
              </div>
            </div>
            <Link href="/admin/fauna/create" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 text-xs font-bold hover:bg-orange-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />Tambah Fauna
            </Link>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-50 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari fauna..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all" />
          </div>
          {search && <button onClick={() => { setSearch(''); router.push('/admin/fauna') }} className="px-4 py-2.5 bg-gray-100 text-xs rounded-xl hover:bg-gray-200 flex items-center gap-2 text-gray-700"><RotateCcw className="w-3.5 h-3.5" />Reset</button>}
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <p className="text-sm font-bold mb-1">Gagal memuat fauna</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 hover:bg-orange-700"><RotateCcw className="w-3.5 h-3.5" />Coba lagi</button>
          </div>
        )}

        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Fauna</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Nama Latin</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Ordo / Famili</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Dilindungi</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  )) : items.data?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Bird className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600 mb-4">Belum ada fauna</p>
                        <Link href="/admin/fauna/create" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-semibold hover:bg-orange-700"><Plus className="w-4 h-4" />Tambah Fauna</Link>
                      </td>
                    </tr>
                  ) : items.data?.map(item => (
                    <tr key={item.id} className="group hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl || item.image_url || '/images/placeholder.svg'} alt={item.name} className="w-14 h-10 rounded-lg object-cover border border-gray-100 shrink-0" onError={e => e.target.src = '/images/placeholder.svg'} />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-500">{item.type || item.category || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 italic hidden md:table-cell">{item.latinName || item.latin_name || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{item.order || item.family || '-'}</td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isProtected || item.is_protected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.isProtected || item.is_protected ? '🛡️ Dilindungi' : 'Tidak Dilindungi'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/fauna/${item.id}`} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/admin/fauna/${item.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                          <button onClick={() => setDeleteTarget(item)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!error && items.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">{items.from}–{items.to} dari {items.total}</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/fauna?page=${page - 1}`)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= items.last_page} onClick={() => router.push(`/admin/fauna?page=${page + 1}`)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
