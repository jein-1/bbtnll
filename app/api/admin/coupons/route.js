import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 15
    const where = {}
    if (search) where.OR = [{ code: { contains: search, mode: 'insensitive' } }]
    const now = new Date()
    const [items, total, active] = await Promise.all([
      prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.coupon.count({ where }),
      prisma.coupon.count({ where: { isActive: true, expiresAt: { gt: now } } }),
    ])
    return NextResponse.json({ coupons: { data: items, total }, stats: { total, active, expired: total - active } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
