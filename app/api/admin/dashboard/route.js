import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  const session = await auth()
  if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || '7days'
  const startDate = searchParams.get('start_date')
  const endDate = searchParams.get('end_date')

  // Compute date range
  const now = new Date()
  let dateFrom = new Date()
  let periodLabel = '7 Hari Terakhir'

  if (period === 'custom' && startDate && endDate) {
    dateFrom = new Date(startDate)
    const dateTo = new Date(endDate)
    dateTo.setHours(23, 59, 59, 999)
    periodLabel = `${startDate} s/d ${endDate}`
  } else {
    switch (period) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        periodLabel = 'Hari Ini'
        break
      case '30days':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        periodLabel = '30 Hari Terakhir'
        break
      case 'this_month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1)
        periodLabel = 'Bulan Ini'
        break
      case 'last_month':
        dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        lastDay.setHours(23, 59, 59, 999)
        periodLabel = 'Bulan Lalu'
        break
      default: // 7days
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        periodLabel = '7 Hari Terakhir'
    }
  }

  try {
    // ── Stats ──────────────────────────────────────────────────────────────────
    const [
      totalUsers,
      newUsersThisMonth,
      totalBookings,
      pendingBookings,
      todayBookings,
      periodBookings,
      totalRevenue,
      periodRevenue,
      contentStats,
      recentBookings,
      recentActivities,
      bookingStatusCounts,
    ] = await Promise.all([
      // Total users
      prisma.user.count().catch(() => 0),
      // New users this month
      prisma.user.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }).catch(() => 0),
      // Total bookings
      prisma.booking?.count().catch(() => 0) ?? 0,
      // Pending bookings
      prisma.booking?.count({ where: { status: 'pending' } }).catch(() => 0) ?? 0,
      // Today bookings
      prisma.booking?.count({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }).catch(() => 0) ?? 0,
      // Period bookings
      prisma.booking?.count({ where: { createdAt: { gte: dateFrom } } }).catch(() => 0) ?? 0,
      // Total revenue
      prisma.booking?.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['confirmed', 'used'] } } }).catch(() => ({ _sum: { totalPrice: 0 } })) ?? { _sum: { totalPrice: 0 } },
      // Period revenue
      prisma.booking?.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['confirmed', 'used'] }, createdAt: { gte: dateFrom } } }).catch(() => ({ _sum: { totalPrice: 0 } })) ?? { _sum: { totalPrice: 0 } },
      // Content stats
      Promise.all([
        prisma.destination?.count().catch(() => 0) ?? 0,
        prisma.flora?.count().catch(() => 0) ?? 0,
        prisma.fauna?.count().catch(() => 0) ?? 0,
        prisma.galleryItem?.count().catch(() => 0) ?? prisma.gallery?.count().catch(() => 0) ?? 0,
        prisma.article?.count().catch(() => 0) ?? prisma.news?.count().catch(() => 0) ?? 0,
        prisma.newsletter?.count().catch(() => 0) ?? 0,
        prisma.testimonial?.count().catch(() => 0) ?? 0,
      ]),
      // Recent bookings
      prisma.booking?.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true, avatar: true } }, destination: { select: { name: true } } },
      }).catch(() => []) ?? [],
      // Recent activity logs
      prisma.activityLog?.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []) ?? [],
      // Booking status counts
      prisma.booking ? Promise.all([
        prisma.booking.count({ where: { status: 'used' } }).catch(() => 0),
        prisma.booking.count({ where: { status: 'pending' } }).catch(() => 0),
        prisma.booking.count({ where: { status: 'confirmed' } }).catch(() => 0),
        prisma.booking.count({ where: { status: 'cancelled' } }).catch(() => 0),
      ]) : Promise.resolve([0, 0, 0, 0]),
    ])

    // ── Chart Labels (7 or 30 days) ────────────────────────────────────────────
    const chartDays = period === '30days' ? 30 : 7
    const labels = []
    const bookingData = []

    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }))
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const dayEnd = new Date(dayStart.getTime() + 86400000)
      const count = await prisma.booking?.count({ where: { createdAt: { gte: dayStart, lt: dayEnd } } }).catch(() => 0) ?? 0
      bookingData.push(count)
    }

    return NextResponse.json({
      periodLabel,
      stats: {
        totalUsers,
        newUsersThisMonth,
        totalBookings,
        pendingBookings,
        todayBookings,
        periodBookings,
        totalRevenue: totalRevenue?._sum?.totalPrice ?? 0,
        periodRevenue: periodRevenue?._sum?.totalPrice ?? 0,
      },
      contentStats: {
        destinations: contentStats[0],
        flora: contentStats[1],
        fauna: contentStats[2],
        gallery: contentStats[3],
        articles: contentStats[4],
        subscribers: contentStats[5],
        testimonials: contentStats[6],
      },
      labels,
      bookingData,
      bookingStatus: {
        used: bookingStatusCounts[0],
        pending: bookingStatusCounts[1],
        confirmed: bookingStatusCounts[2],
        cancelled: bookingStatusCounts[3],
      },
      recentBookings: recentBookings.map(b => ({
        id: b.id,
        userName: b.user?.name ?? '-',
        userEmail: b.user?.email ?? '-',
        destination: b.destination?.name ?? '-',
        status: b.status,
        totalPrice: b.totalPrice,
        visitDate: b.visitDate,
        createdAt: b.createdAt,
      })),
      recentActivities: recentActivities.map(a => ({
        id: a.id,
        description: a.description,
        createdAt: a.createdAt,
      })),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Gagal memuat data dashboard', detail: error.message }, { status: 500 })
  }
}
