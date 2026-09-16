'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import {
  BarChart3, TrendingUp, TrendingDown, Users, Eye, Globe, Clock,
  MousePointerClick, Smartphone, Monitor, Tablet, ArrowUpRight, Activity
} from 'lucide-react'

const StatCard = ({ label, value, change, icon: Icon, color = 'emerald', sub }) => {
  const isUp = change >= 0
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${color}-50`}>
          <Icon className={`w-4.5 h-4.5 text-${color}-600`} />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {isUp ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
        <span className={`text-xs font-semibold ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-gray-400">{sub || 'vs bulan lalu'}</span>
      </div>
    </div>
  )
}

const BarItem = ({ label, value, max, color = 'bg-emerald-500' }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-600 w-28 truncate shrink-0">{label}</span>
    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
    <span className="text-xs font-semibold text-gray-700 w-12 text-right">{value.toLocaleString()}</span>
  </div>
)

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      const json = await res.json()
      setData(json)
    } catch {
      // Use mock data if API not available
      setData({
        pageviews: 24580, pageviewsChange: 12.4,
        visitors: 8320, visitorsChange: 8.1,
        sessions: 11240, sessionsChange: 5.6,
        bounceRate: 38.2, bounceRateChange: -2.1,
        avgDuration: '2m 34s', avgDurationChange: 3.2,
        newUsers: 3840, newUsersChange: 15.7,
        topPages: [
          { path: '/destinasi', views: 4280 },
          { path: '/', views: 3950 },
          { path: '/berita', views: 2810 },
          { path: '/galeri', views: 2340 },
          { path: '/tentang', views: 1820 },
        ],
        topSources: [
          { source: 'Google', sessions: 4820 },
          { source: 'Direct', sessions: 3210 },
          { source: 'Instagram', sessions: 1540 },
          { source: 'Facebook', sessions: 980 },
          { source: 'Twitter', sessions: 420 },
        ],
        devices: { desktop: 52, mobile: 38, tablet: 10 },
        dailyViews: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          views: Math.floor(Math.random() * 1000 + 400),
        })),
      })
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { const init = async () => { await fetchData() }; init() }, [fetchData])

  const maxPage = data?.topPages?.[0]?.views ?? 1
  const maxSource = data?.topSources?.[0]?.sessions ?? 1

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 shadow-2xl">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-xl blur-lg" />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xl ring-2 ring-white/30">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white mb-0.5">Analitik Website</h1>
                <p className="text-green-100/80 text-xs">Pantau performa dan traffic website TNLL secara real-time</p>
              </div>
            </div>
            {/* Period Selector */}
            <div className="flex gap-1.5 bg-white/10 p-1 rounded-xl">
              {[['7d', '7 Hari'], ['30d', '30 Hari'], ['90d', '90 Hari']].map(([val, label]) => (
                <button key={val} onClick={() => setPeriod(val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === val ? 'bg-white text-emerald-700 shadow' : 'text-white/80 hover:bg-white/10'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Pageviews" value={data.pageviews?.toLocaleString()} change={data.pageviewsChange} icon={Eye} color="blue" />
              <StatCard label="Pengunjung Unik" value={data.visitors?.toLocaleString()} change={data.visitorsChange} icon={Users} color="emerald" />
              <StatCard label="Sesi" value={data.sessions?.toLocaleString()} change={data.sessionsChange} icon={Activity} color="purple" />
              <StatCard label="Bounce Rate" value={`${data.bounceRate}%`} change={data.bounceRateChange} icon={MousePointerClick} color="orange" sub="vs bulan lalu" />
              <StatCard label="Durasi Rata-rata" value={data.avgDuration} change={data.avgDurationChange} icon={Clock} color="teal" />
              <StatCard label="Pengguna Baru" value={data.newUsers?.toLocaleString()} change={data.newUsersChange} icon={TrendingUp} color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Top Pages */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" /> Halaman Terpopuler
                  </p>
                </div>
                <div className="p-5 space-y-3.5">
                  {data.topPages?.map(p => (
                    <BarItem key={p.path} label={p.path} value={p.views} max={maxPage} color="bg-emerald-500" />
                  ))}
                </div>
              </div>

              {/* Top Sources */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-blue-500" /> Sumber Traffic
                  </p>
                </div>
                <div className="p-5 space-y-3.5">
                  {data.topSources?.map(s => (
                    <BarItem key={s.source} label={s.source} value={s.sessions} max={maxSource} color="bg-blue-500" />
                  ))}
                </div>
              </div>

              {/* Device Split */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-purple-500" /> Perangkat
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { label: 'Desktop', value: data.devices?.desktop, icon: Monitor, color: 'bg-purple-500' },
                    { label: 'Mobile', value: data.devices?.mobile, icon: Smartphone, color: 'bg-emerald-500' },
                    { label: 'Tablet', value: data.devices?.tablet, icon: Tablet, color: 'bg-orange-500' },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <d.icon className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">{d.label}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-800">{d.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
