"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // Auth login menggunakan konfigurasi "admin-credentials" di auth.js
      const res = await signIn('admin-credentials', {
        redirect: false,
        email,
        password
      })

      if (!res) {
        setError('Tidak ada respons dari server. Coba lagi.')
        setIsLoading(false)
        return
      }

      if (res.error || !res.ok) {
        if (res.error === 'ADMIN_BLOCKED') {
          setError('Akun admin Anda telah dinonaktifkan.')
        } else {
          setError('Kredensial tidak valid. Silakan periksa kembali email dan kata sandi Anda.')
        }
        setIsLoading(false)
      } else {
        router.push('/admin/dashboard') // Redirect ke dashboard jika berhasil
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-800 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
             <span className="text-white font-black text-3xl leading-none">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Portal Admin TNLL</h1>
          <p className="text-slate-400 text-sm">Gunakan kredensial admin Anda untuk masuk ke dasbor manajemen.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Alamat Email</Label>
            <Input 
              id="email" 
              type="text" 
              placeholder="admin@tnll.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl bg-slate-900 border-slate-800 text-white focus-visible:ring-emerald-500" 
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300">Kata Sandi</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl bg-slate-900 border-slate-800 text-white focus-visible:ring-emerald-500" 
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base mt-4 shadow-lg shadow-emerald-600/20 transition-all"
          >
            {isLoading ? 'Memproses...' : 'Masuk ke Dasbor'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-white transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
