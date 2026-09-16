import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 15

    const where = {}
    if (search) where.OR = [{ bookingCode: { contains: search, mode: 'insensitive' } }, { user: { name: { contains: search, mode: 'insensitive' } } }]
    if (status) where.status = status

    const [items, total, pending, confirmed, cancelled, revenue] = await Promise.all([
      prisma.booking.findMany({ where, include: { user: { select: { name: true, email: true } }, destination: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['confirmed', 'completed'] } } }),
    ])
    const destinations = await prisma.destination.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
    return NextResponse.json({ bookings: { data: items, total }, destinations, stats: { total, pending, confirmed, cancelled, revenue: revenue._sum.totalPrice ?? 0 } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
