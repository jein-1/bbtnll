import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Dasbor Admin - TNLL',
}

export default async function AdminDashboard() {
  // Cek sesi login
  const session = await auth()
  
  // Jika tidak ada sesi atau bukan admin, tendang kembali ke login
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
              {session.user.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Selamat datang, {session.user.name} 👋
              </h1>
              <p className="text-slate-500 mt-1">
                Anda login sebagai <span className="font-semibold text-emerald-600 uppercase text-xs tracking-wider bg-emerald-50 px-2 py-1 rounded-md">{session.user.role}</span>
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Statistik Kosong */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-500">Total Pengunjung</h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-500">Total Berita</h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-medium text-slate-500">Menunggu Persetujuan</h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
