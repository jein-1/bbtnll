'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect } from 'react'
import { Settings, Save, CheckCircle, XCircle, Globe, Phone, Mail, MapPin, Link2, AtSign, Video, MessageCircle } from 'lucide-react'

// Field component MUST be outside the page component to avoid re-creation on each render
function Field({ label, icon: Icon, name, value, onChange, type = 'text', placeholder, rows }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        {label}
      </label>
      {rows ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(name, e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/50 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
        />
      )}
    </div>
  )
}

export default function AdminSiteInfoPage() {
  const [form, setForm] = useState({
    siteName: '', tagline: '', description: '', email: '', phone: '', address: '',
    facebook: '', instagram: '', youtube: '', twitter: '',
    metaTitle: '', metaDescription: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000) }

  // Update a single form field
  const handleChange = (name, value) => setForm(f => ({ ...f, [name]: value }))

  useEffect(() => {
    fetch('/api/admin/site-info')
      .then(r => r.json())
      .then(data => { if (data.siteInfo) setForm(prev => ({ ...prev, ...data.siteInfo })) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast('Pengaturan berhasil disimpan')
    } catch {
      showToast('Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-9999 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-700'}`}>
          {toast.type === 'error' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      <div className="space-y-4">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30 shadow-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white mb-0.5">Informasi Website</h1>
              <p className="text-green-100/80 text-xs">Kelola informasi umum dan pengaturan website TNLL</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Informasi Umum */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />Informasi Umum
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Nama Website" name="siteName" value={form.siteName} onChange={handleChange} placeholder="TNLL Explore" />
              <Field label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} placeholder="Jelajahi Keindahan Alam" />
              <Field label="Deskripsi" name="description" value={form.description} onChange={handleChange} placeholder="Deskripsi website..." rows={3} />
            </div>
          </div>

          {/* Kontak */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />Informasi Kontak
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Email" icon={Mail} name="email" value={form.email} onChange={handleChange} type="email" placeholder="info@tnll.go.id" />
              <Field label="Telepon" icon={Phone} name="phone" value={form.phone} onChange={handleChange} placeholder="+62 451 123456" />
              <Field label="Alamat" icon={MapPin} name="address" value={form.address} onChange={handleChange} placeholder="Jl. Tanggul No. 1, Palu" rows={2} />
            </div>
          </div>

          {/* Media Sosial */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />Media Sosial
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Facebook" icon={Link2} name="facebook" value={form.facebook} onChange={handleChange} placeholder="https://facebook.com/tnll" />
              <Field label="Instagram" icon={AtSign} name="instagram" value={form.instagram} onChange={handleChange} placeholder="https://instagram.com/tnll" />
              <Field label="YouTube" icon={Video} name="youtube" value={form.youtube} onChange={handleChange} placeholder="https://youtube.com/@tnll" />
              <Field label="Twitter / X" icon={MessageCircle} name="twitter" value={form.twitter} onChange={handleChange} placeholder="https://twitter.com/tnll" />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" />SEO &amp; Meta
              </p>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Meta Title" name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="TNLL Explore | Taman Nasional Lore Lindu" />
              <Field label="Meta Description" name="metaDescription" value={form.metaDescription} onChange={handleChange} placeholder="Jelajahi keindahan alam..." rows={4} />
            </div>
          </div>

          {/* Submit */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
