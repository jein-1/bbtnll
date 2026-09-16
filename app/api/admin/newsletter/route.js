import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 20
    const where = {}
    if (search) where.email = { contains: search, mode: 'insensitive' }
    const [items, total, active] = await Promise.all([
      prisma.newsletter.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.newsletter.count({ where }),
      prisma.newsletter.count({ where: { isActive: true } }),
    ])
    return NextResponse.json({ newsletter: { data: items, total }, stats: { total, active, inactive: total - active } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
