export const metadata = {
  title: { template: '%s - Admin TNLL', default: 'Admin TNLL' },
  description: 'Panel administrasi TNLL Explore',
}

// Proteksi rute ditangani oleh proxy.js (middleware).
// Layout ini HANYA untuk metadata — jangan tambahkan redirect di sini
// karena akan menyebabkan infinite redirect loop di /admin/login.
export default function AdminRootLayout({ children }) {
  return <>{children}</>
}
