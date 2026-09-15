import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata = {
  title: 'Daftar Akun Baru',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daftar Akun Baru</h1>
          <p className="text-slate-500 mt-2 text-sm">Buat akun untuk mulai memesan tiket TNLL.</p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" type="text" placeholder="John Doe" required className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" placeholder="nama@email.com" required className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input id="password" type="password" required className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Ulangi Kata Sandi</Label>
            <Input id="confirm_password" type="password" required className="h-12 rounded-xl" />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base mt-2">
            Daftar Sekarang
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  )
}
