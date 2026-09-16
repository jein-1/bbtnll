'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, Star, CheckCircle, XCircle, Trash2, Eye, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react'

function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }
function Avatar({ name }) {
  const init = name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U'
  return <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{init}</div>
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/testimonials')
      if (!res.ok) throw new Error('Gagal memuat testimoni')
      const data = await res.json()
      setItems(data.testimonials ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  const handleApprove = async (id) => {
    await fetch(`/api/admin/testimonials/${id}/approve`, { method: 'POST' })
    showToast('Testimoni disetujui'); await fetchData()
  }
  const handleReject = async (id) => {
    await fetch(`/api/admin/testimonials/${id}/reject`, { method: 'POST' })
    showToast('Testimoni ditolak', 'deleted'); await fetchData()
  }
  const handleDelete = async (id) => {
    if (!confirm('Hapus testimoni ini?')) return
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    showToast('Testimoni dihapus', 'deleted'); await fetchData()
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'deleted' ? 'bg-orange-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 via-purple-600 to-violet-600 p-6 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" /></div>
          <div className="relative flex items-center gap-4">
            <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl"><MessageSquare className="h-6 w-6 text-white" /></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">Manajemen Testimoni</h1>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Testimoni</span>
              </div>
              <p className="text-indigo-100/80 text-xs">Kelola ulasan dan testimoni dari pengunjung</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: items.total, icon: MessageSquare, cls: 'from-indigo-500 to-purple-600' },
            { label: 'Menunggu', value: items.data?.filter(t => t.status === 'pending').length || 0, icon: Star, cls: 'from-amber-500 to-orange-600' },
            { label: 'Disetujui', value: items.data?.filter(t => t.status === 'approved').length || 0, icon: CheckCircle, cls: 'from-emerald-500 to-teal-600' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="relative flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br ${s.cls} group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    {loading ? <Skeleton className="h-6 w-10 mb-1" /> : <p className="text-xl font-black text-gray-900">{s.value}</p>}
                    <p className="text-[10px] text-gray-500">{s.label}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && <div className="rounded-xl bg-white p-8 text-center border border-red-100 shadow-lg"><XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" /><p className="text-sm font-bold">{error}</p></div>}

        {/* Cards */}
        {!error && (
          <div className="space-y-3">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"><Skeleton className="h-16 w-full" /></div>
            )) : items.data?.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <MessageSquare className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                <p className="text-sm font-semibold text-gray-600">Belum ada testimoni</p>
              </div>
            ) : items.data?.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all ${item.status === 'pending' ? 'border-amber-200 bg-amber-50/30' : item.status === 'approved' ? 'border-emerald-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-4">
                  <Avatar name={item.user?.name || item.userName || item.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-sm font-bold text-gray-900">{item.user?.name || item.userName || item.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'pending' ? 'bg-amber-100 text-amber-700' : item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status === 'pending' ? 'Pending' : item.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (item.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-[10px] text-gray-500 ml-1">{item.destination?.name || item.destination || ''}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.comment || item.content}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(item.id)} className="p-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"><ThumbsUp className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(item.id)} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><ThumbsDown className="w-4 h-4" /></button>
                      </>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
