'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react'

function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }
const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/announcements')
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setItems(data.announcements ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id) => {
    if (!confirm('Hapus pengumuman ini?')) return
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    showToast('Pengumuman dihapus', 'deleted'); await fetchData()
  }

  const TYPE_CONFIG = {
    info:    { cls: 'bg-blue-100 text-blue-700',    label: 'Info'     },
    warning: { cls: 'bg-amber-100 text-amber-700',  label: 'Peringatan' },
    success: { cls: 'bg-emerald-100 text-emerald-700', label: 'Sukses' },
    error:   { cls: 'bg-red-100 text-red-700',      label: 'Penting'  },
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" /></div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl"><Bell className="h-6 w-6 text-white" /></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">Pengumuman</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Pengumuman</span>
                </div>
                <p className="text-violet-100/80 text-xs">Kelola pengumuman dan notifikasi sistem</p>
              </div>
            </div>
            <Link href="/admin/announcements/create" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-violet-700 text-xs font-bold hover:bg-violet-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />Buat Pengumuman
            </Link>
          </div>
        </div>

        {error && <div className="rounded-xl bg-white p-8 text-center border border-red-100"><XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" /><p className="text-sm font-bold">{error}</p></div>}

        {!error && (
          <div className="space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"><Skeleton className="h-16 w-full" /></div>
            )) : items.data?.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Bell className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600 mb-4">Belum ada pengumuman</p>
                <Link href="/admin/announcements/create" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700"><Plus className="w-4 h-4" />Buat Pengumuman</Link>
              </div>
            ) : items.data?.map(item => {
              const tc = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info
              return (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.cls}`}>{tc.label}</span>
                        {item.isActive !== false && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">{item.content || item.message}</p>
                      <p className="text-[10px] text-gray-400">{fmtDate(item.startDate || item.start_date)} – {fmtDate(item.endDate || item.end_date)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Link href={`/admin/announcements/${item.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
