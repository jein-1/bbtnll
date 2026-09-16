'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Tag, Plus, Edit, Trash2, CheckCircle, XCircle, Copy } from 'lucide-react'
function Skeleton({ c = '' }) { return <div className={`animate-pulse bg-gray-100 rounded-lg ${c}`} /> }
const fmtCurrency = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0)

export default function AdminCouponsPage() {
  const [items, setItems] = useState({ data: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const showToast = (m, t = 'success') => { setToast({ m, t }); setTimeout(() => setToast(null), 3000) }
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/admin/coupons')
      if (!res.ok) throw new Error('Gagal memuat kupon')
      const data = await res.json()
      setItems(data.coupons ?? { data: [], total: 0 })
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { const init = async () => { await fetchData() }; init() }, [fetchData])
  const handleDelete = async (id) => {
    if (!confirm('Hapus kupon ini?')) return
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    showToast('Kupon dihapus', 'deleted'); await fetchData()
  }
  return (
    <AdminLayout>
      {toast && <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.t === 'error' ? 'bg-red-600' : 'bg-primary-600'}`}><CheckCircle className="w-4 h-4" />{toast.m}</div>}
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-pink-600 via-rose-600 to-red-600 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative"><div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30"><Tag className="h-6 w-6 text-white" /></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-white">Manajemen Kupon</h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold text-white/90">{items.total} Kupon</span>
                </div>
                <p className="text-pink-100/80 text-xs">Kelola kode diskon dan kupon promo</p>
              </div>
            </div>
            <Link href="/admin/coupons/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-pink-700 text-xs font-bold hover:bg-pink-50 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg">
              <Plus className="w-4 h-4" />Buat Kupon
            </Link>
          </div>
        </div>

        {error && <div className="bg-white rounded-xl p-8 text-center border border-red-100"><XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" /><p className="text-sm font-bold">{error}</p></div>}
        {!error && (
          <div className="rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase">Kode</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Diskon</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Berlaku</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Digunakan</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-3"><Skeleton c="h-4 w-full" /></td>)}</tr>
                )) : items.data?.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center"><Tag className="mx-auto mb-3 w-12 h-12 text-gray-300" /><p className="text-sm font-semibold text-gray-600 mb-4">Belum ada kupon</p><Link href="/admin/coupons/create" className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold hover:bg-pink-700"><Plus className="w-4 h-4" />Buat Kupon</Link></td></tr>
                ) : items.data?.map(item => {
                  const isActive = item.isActive !== false && (!item.expiresAt || new Date(item.expiresAt) > new Date())
                  const disc = item.discountType === 'percentage' ? `${item.discount}%` : fmtCurrency(item.discount || item.discountAmount)
                  return (
                    <tr key={item.id} className="group hover:bg-pink-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">{item.code}</span>
                          <button onClick={() => navigator.clipboard.writeText(item.code)} className="text-gray-400 hover:text-gray-700"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 hidden md:table-cell">{disc}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('id-ID') : 'Selamanya'}</td>
                      <td className="px-4 py-3 text-xs text-center text-gray-600 hidden lg:table-cell">{item.usedCount || 0} / {item.maxUses || '∞'}</td>
                      <td className="px-4 py-3 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />{isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/coupons/${item.id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-4 h-4" /></Link>
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
