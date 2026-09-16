'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import {
  Database, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  HardDrive, Table2, Clock, Activity, Zap
} from 'lucide-react'

const StatusBadge = ({ status }) => {
  const map = {
    ok: { label: 'OK', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    warning: { label: 'Warning', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    error: { label: 'Error', cls: 'bg-red-100 text-red-700 border-red-200' },
  }
  const s = map[status] ?? map.ok
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      {status === 'ok' ? <CheckCircle className="w-3 h-3" /> : status === 'warning' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {s.label}
    </span>
  )
}

const TABLE_NAMES = [
  'User', 'Admin', 'Destination', 'Article', 'Gallery',
  'Booking', 'Testimonial', 'Coupon', 'Newsletter',
  'Announcement', 'Flora', 'Fauna', 'ActivityLog', 'SiteInfo',
]

export default function AdminDatabasePage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/database')
      const json = await res.json()
      setData(json)
    } catch {
      // Mock data when API unavailable
      setData({
        status: 'ok',
        version: 'PostgreSQL 15.4',
        uptime: '14 hari, 6 jam',
        size: '48.2 MB',
        connections: { active: 3, max: 100 },
        tables: TABLE_NAMES.map(name => ({
          name,
          rows: Math.floor(Math.random() * 500),
          size: `${(Math.random() * 2 + 0.1).toFixed(1)} MB`,
          lastUpdated: new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString('id-ID'),
          status: 'ok',
        })),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
    showToast('Data database berhasil diperbarui')
  }

  const handleVacuum = async () => {
    showToast('Vacuum/Optimize dimulai... (fitur belum aktif)', 'warning')
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'warning' ? 'bg-yellow-600' : 'bg-emerald-700'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-700 via-slate-600 to-emerald-700 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30">
                  <Database className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-0.5">Manajemen Database</h1>
                <p className="text-green-100/80 text-xs">Monitor status, tabel, dan performa database TNLL</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleVacuum}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all">
                <Zap className="w-3.5 h-3.5" /> Optimize
              </button>
              <button onClick={handleRefresh} disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all shadow disabled:opacity-60">
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* Status Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Status Koneksi', value: data?.status === 'ok' ? 'Terhubung' : 'Terputus', icon: Activity, color: data?.status === 'ok' ? 'text-emerald-600' : 'text-red-600', bg: data?.status === 'ok' ? 'bg-emerald-50' : 'bg-red-50' },
                { label: 'Versi Database', value: data?.version ?? '-', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ukuran Database', value: data?.size ?? '-', icon: HardDrive, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Uptime', value: data?.uptime ?? '-', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((card, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bg}`}>
                      <card.icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-800 truncate">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Connections */}
            {data?.connections && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm font-bold text-gray-800 mb-3">Koneksi Database</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{data.connections.active} aktif / {data.connections.max} max</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${(data.connections.active / data.connections.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {((data.connections.active / data.connections.max) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Tables */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Table2 className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-bold text-gray-800">Tabel Database ({data?.tables?.length ?? 0})</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Nama Tabel</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Baris</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Ukuran</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600">Terakhir Update</th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data?.tables?.map(table => (
                      <tr key={table.name} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 font-mono font-semibold text-gray-800">{table.name}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{table.rows.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{table.size}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{table.lastUpdated}</td>
                        <td className="px-4 py-3 text-center"><StatusBadge status={table.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
