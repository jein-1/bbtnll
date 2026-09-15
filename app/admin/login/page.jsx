import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = {
  title: 'Admin Login - TNLL',
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-slate-800 relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
             <span className="text-white font-black text-3xl leading-none">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Portal Admin TNLL</h1>
          <p className="text-slate-400 text-sm">Gunakan kredensial admin Anda untuk masuk ke dasbor manajemen.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Alamat Email / Username</Label>
            <Input 
              id="email" 
              type="text" 
              placeholder="admin@tnll.com" 
              required 
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
              className="h-12 rounded-xl bg-slate-900 border-slate-800 text-white focus-visible:ring-emerald-500" 
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base mt-4 shadow-lg shadow-emerald-600/20 transition-all">
            Masuk ke Dasbor
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
