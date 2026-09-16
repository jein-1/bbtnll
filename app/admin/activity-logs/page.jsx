'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { Activity, Clock, User, FileText, MapPin, Settings, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }

const ACTION_CONFIG = {
  created: { label: 'Dibuat',    cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  updated: { label: 'Diubah',    cls: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'    },
  deleted: { label: 'Dihapus',   cls: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
  login:   { label: 'Login',     cls: 'bg-purple-100 text-purple-700',   dot: 'bg-purple-500'  },
  logout:  { label: 'Logout',    cls: 'bg-gray-100 text-gray-600',       dot: 'bg-gray-400'    },
  export:  { label: 'Export',    cls: 'bg-amber-100 text-amber-700',     dot: 'bg-amber-500'   },
}

export default function AdminActivityLogsPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/activity-logs')
      if (!res.ok) throw new Error('Gagal memuat log aktivitas')
      const data = await res.json()
      setItems(data.logs ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-700 via-gray-700 to-zinc-700 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30"><Activity className="h-6 w-6 text-white" /></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">Log Aktivitas</h1>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Log</span>
              </div>
              <p className="text-gray-300/80 text-xs">Rekam jejak semua aktivitas sistem</p>
            </div>
          </div>
        </div>

        {error && <div className="bg-white rounded-xl p-8 text-center border border-red-100"><XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" /><p className="text-sm font-bold">{error}</p><button onClick={fetchData} className="mt-4 px-4 py-2 bg-gray-700 text-white text-xs rounded-xl hover:bg-gray-800">Coba lagi</button></div>}

        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Aktivitas</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Pengguna</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">IP Address</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden sm:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : items.data?.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Activity className="mx-auto mb-3 w-12 h-12 text-gray-300" /><p className="text-sm font-semibold text-gray-600">Belum ada log aktivitas</p></td></tr>
                ) : items.data?.map(log => {
                  const ac = ACTION_CONFIG[log.action?.toLowerCase()] ?? { label: log.action, cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' }
                  return (
                    <tr key={log.id} className="group hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-800">{log.description || log.subject || '-'}</p>
                        <p className="text-[10px] text-gray-400">{log.model || log.module || ''}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs font-semibold text-gray-700">{log.user?.name || log.userName || 'System'}</p>
                        <p className="text-[10px] text-gray-400">{log.user?.email || log.userEmail || ''}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono hidden lg:table-cell">{log.ipAddress || log.ip || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${ac.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${ac.dot}`} />{ac.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-xs text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
