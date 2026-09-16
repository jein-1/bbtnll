import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = {
  title: 'Masuk (Login)',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 mx-auto flex items-center justify-center mb-4">
             <span className="text-white font-bold text-2xl leading-none">T</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang Kembali</h1>
          <p className="text-slate-500 mt-2 text-sm">Masuk untuk mengelola pesanan tiket Anda.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" required className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
              <Link href="/lupa-sandi" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">Lupa sandi?</Link>
            </div>
            <Input id="password" type="password" required className="h-12 rounded-xl" />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base">
            Masuk Sekarang
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
