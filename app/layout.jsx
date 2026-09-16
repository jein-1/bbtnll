import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    template: '%s | TNLL Explore',
    default: 'TNLL Explore - Taman Nasional Lore Lindu',
  },
  description: 'Jelajahi keindahan alam Taman Nasional Lore Lindu, destinasi wisata, flora, fauna, dan budaya.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#071b17',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
