'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import { Mail, Trash2, CheckCircle, XCircle, Download, Users } from 'lucide-react'

function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }

export default function AdminNewsletterPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/newsletter')
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setItems(data.subscribers ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { const init = async () => { await fetchData() }; init() }, [fetchData])

  const handleDelete = async (id) => {
    if (!confirm('Hapus subscriber ini?')) return
    await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' })
    showToast('Subscriber dihapus', 'deleted'); await fetchData()
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
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-cyan-600 via-sky-600 to-blue-600 p-6 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none"><div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" /></div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl"><Mail className="h-6 w-6 text-white" /></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">Newsletter</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Subscriber</span>
                </div>
                <p className="text-cyan-100/80 text-xs">Kelola subscriber newsletter TNLL</p>
              </div>
            </div>
            <button onClick={() => window.open('/api/admin/newsletter/export', '_blank')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-cyan-700 text-xs font-bold hover:bg-cyan-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Download className="w-4 h-4" />Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Subscriber', value: items.total, icon: Users, cls: 'from-cyan-500 to-sky-600' },
            { label: 'Aktif', value: items.data?.filter(s => s.isActive !== false).length || 0, icon: Mail, cls: 'from-emerald-500 to-teal-600' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-center gap-3">
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

        {/* Table */}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Nama</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : items.data?.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Mail className="mx-auto mb-3 w-12 h-12 text-gray-300" /><p className="text-sm font-semibold text-gray-600">Belum ada subscriber</p></td></tr>
                ) : items.data?.map(item => (
                  <tr key={item.id} className="group hover:bg-cyan-50/30 transition-colors">
                    <td className="px-4 py-3"><p className="text-xs font-semibold text-gray-800">{item.email}</p></td>
                    <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">{item.name || '-'}</td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {item.isActive !== false ? 'Aktif' : 'Berhenti'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
