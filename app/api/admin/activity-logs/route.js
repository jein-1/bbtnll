import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 20
    const where = {}
    if (search) where.OR = [{ action: { contains: search, mode: 'insensitive' } }, { entity: { contains: search, mode: 'insensitive' } }]
    const [items, total] = await Promise.all([
      prisma.activityLog.findMany({ where, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.activityLog.count({ where }),
    ])
    return NextResponse.json({ logs: { data: items, total }, stats: { total } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
