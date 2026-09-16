'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Users, UserPlus, Eye, Edit, Trash2, Search, RotateCcw,
  UserCheck, UserX, Shield, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react'

const fmtDate = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`} />
}

function Avatar({ name, avatar, size = 'h-9 w-9' }) {
  const initials = name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U'
  if (avatar) return <img src={avatar} alt={name} className={`${size} rounded-xl object-cover ring-2 ring-gray-100`} onError={e => e.target.style.display = 'none'} />
  return (
    <div className={`${size} rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0`}>
      {initials}
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState({ data: [], total: 0 })
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0, newThisMonth: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
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
      const res = await fetch(`/api/admin/users?${q}`)
      if (!res.ok) throw new Error('Gagal memuat data user')
      const data = await res.json()
      setUsers(data.users ?? { data: [], total: 0 })
      setStats(data.stats ?? { total: 0, active: 0, blocked: 0, newThisMonth: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [searchParams])

  const applyFilters = useCallback(() => {
    const q = new URLSearchParams()
    if (search) q.set('search', search)
    if (status) q.set('status', status)
    router.push(`/admin/users?${q}`)
  }, [search, status, router])

  useEffect(() => { const init = async () => { await fetchData() }; init() }, [fetchData])

  useEffect(() => {
    clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(() => applyFilters(), 400)
  }, [search]) // eslint-disable-line

  const handleDelete = async () => {
    setDeleteConfirm(d => ({ ...d, loading: true }))
    try {
      await fetch(`/api/admin/users/${deleteConfirm.id}`, { method: 'DELETE' })
      showToast('User berhasil dihapus', 'deleted')
      setDeleteConfirm({ show: false, id: null, name: '', loading: false })
      await fetchData()
    } catch {
      showToast('Gagal menghapus user', 'error')
      setDeleteConfirm(d => ({ ...d, loading: false }))
    }
  }

  const toggleBlock = async (user) => {
    const action = user.status === 'active' ? 'block' : 'unblock'
    try {
      await fetch(`/api/admin/users/${user.id}/${action}`, { method: 'POST' })
      showToast(action === 'block' ? 'User diblokir' : 'User diaktifkan')
      await fetchData()
    } catch { showToast('Terjadi kesalahan', 'error') }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm({ show: false, id: null, name: '', loading: false })} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-center text-sm font-bold mb-1">Hapus User</h3>
            <p className="text-center text-xs text-gray-500 mb-5">Hapus akun <strong>&ldquo;{deleteConfirm.name}&rdquo;</strong> secara permanen?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm({ show: false, id: null, name: '', loading: false })} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={deleteConfirm.loading} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-60">
                {deleteConfirm.loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 animate-page">
        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">Manajemen User</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{stats.total} Total</span>
                </div>
                <p className="text-orange-100/80 text-xs">Kelola semua akun pengguna terdaftar</p>
              </div>
            </div>
            <Link href="/admin/users/create"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-600 text-xs font-bold hover:bg-orange-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span>Tambah User</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Pengguna', value: stats.total, icon: Users, from: 'from-blue-500', to: 'to-indigo-600', shadow: 'shadow-blue-500/30' },
            { label: 'Pengguna Aktif', value: stats.active, icon: UserCheck, from: 'from-emerald-500', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
            { label: 'Diblokir', value: stats.blocked, icon: UserX, from: 'from-red-500', to: 'to-rose-600', shadow: 'shadow-red-500/30' },
            { label: 'Baru Bulan Ini', value: stats.newThisMonth, icon: UserPlus, from: 'from-orange-500', to: 'to-amber-600', shadow: 'shadow-orange-500/30' },
          ].map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
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
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pengguna..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all" />
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); applyFilters() }}
              className="px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-orange-400 transition-all text-gray-700">
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="blocked">Diblokir</option>
            </select>
            {(search || status) && (
              <button onClick={() => { setSearch(''); setStatus(''); router.push('/admin/users') }}
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
            <p className="text-sm font-bold text-gray-900 mb-1">Gagal memuat user</p>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button onClick={fetchData} className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-xs font-semibold rounded-xl hover:bg-orange-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />Coba lagi
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">Pengguna</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                    <th className="px-4 py-3.5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Bergabung</th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}</tr>
                  )) : users.data?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Users className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">Tidak ada pengguna</p>
                      </td>
                    </tr>
                  ) : users.data?.map(user => (
                    <tr key={user.id} className="group hover:bg-linear-to-r hover:from-orange-50/50 hover:to-amber-50/30 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} avatar={user.avatar} />
                          <div>
                            <p className="text-xs font-bold text-gray-900">{user.name}</p>
                            <p className="text-[10px] text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-600">{user.phone || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {user.status === 'active' ? 'Aktif' : 'Diblokir'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{fmtDate(user.createdAt || user.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${user.id}`} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></Link>
                          <Link href={`/admin/users/${user.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
                          <button onClick={() => toggleBlock(user)} className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-orange-500 hover:text-green-600 hover:bg-green-50'}`}>
                            {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setDeleteConfirm({ show: true, id: user.id, name: user.name, loading: false })}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!error && users.last_page > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">{users.from}–{users.to} dari {users.total} pengguna</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => router.push(`/admin/users?page=${page - 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= users.last_page} onClick={() => router.push(`/admin/users?page=${page + 1}`)}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
