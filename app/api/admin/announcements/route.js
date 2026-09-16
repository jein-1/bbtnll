import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 15
    const where = {}
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }]
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.announcement.count({ where }),
    ])
    return NextResponse.json({ announcements: { data: items, total }, stats: { total } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
