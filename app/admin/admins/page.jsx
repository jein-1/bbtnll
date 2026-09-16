'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Shield, Plus, Edit, Trash2, CheckCircle, XCircle, UserCog } from 'lucide-react'
function Skeleton({ className = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} /> }

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', cls: 'bg-red-100 text-red-700'   },
  admin:       { label: 'Admin',       cls: 'bg-blue-100 text-blue-700' },
  editor:      { label: 'Editor',      cls: 'bg-green-100 text-green-700' },
}

export default function AdminAdminsPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const showToast = (m, t = 'success') => { setToast({ m, t }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/admins')
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      setItems(data.admins ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchData() }, [fetchData])
  const handleDelete = async (id) => {
    if (!confirm('Hapus admin ini?')) return
    await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
    showToast('Admin dihapus', 'deleted'); await fetchData()
  }
  const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

  return (
    <AdminLayout>
      {toast && <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.t === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}><CheckCircle className="w-4 h-4" />{toast.m}</div>}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-red-700 via-rose-700 to-pink-700 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30"><Shield className="h-6 w-6 text-white" /></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">Manajemen Admin</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Admin</span>
                </div>
                <p className="text-red-100/80 text-xs">Kelola akun admin dan hak akses sistem</p>
              </div>
            </div>
            <Link href="/admin/admins/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-red-700 text-xs font-bold hover:bg-red-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Plus className="w-4 h-4" />Tambah Admin
            </Link>
          </div>
        </div>

        {error && <div className="bg-white rounded-xl p-8 text-center border border-red-100"><XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" /><p className="text-sm font-bold">{error}</p></div>}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Bergabung</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
                )) : items.data?.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center"><Shield className="mx-auto mb-3 w-12 h-12 text-gray-300" /><p className="text-sm font-semibold text-gray-600 mb-4">Belum ada admin</p><Link href="/admin/admins/create" className="inline-flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl text-xs font-semibold hover:bg-red-800"><Plus className="w-4 h-4" />Tambah Admin</Link></td></tr>
                ) : items.data?.map(item => {
                  const rc = ROLE_CONFIG[item.role] ?? { label: item.role, cls: 'bg-gray-100 text-gray-600' }
                  const init = item.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'A'
                  return (
                    <tr key={item.id} className="group hover:bg-red-50/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.avatar ? <img src={item.avatar} alt={item.name} className="w-9 h-9 rounded-xl object-cover" /> : (
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{init}</div>
                          )}
                          <div><p className="text-xs font-bold text-gray-900">{item.name}</p><p className="text-[10px] text-gray-500">{item.email}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${rc.cls}`}>{rc.label}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{fmtDate(item.createdAt || item.created_at)}</td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {item.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/admins/${item.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
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
