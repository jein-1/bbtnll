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
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
    if (status) where.status = status

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const [items, total, active, blocked, newThisMonth] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, username: true, status: true, avatar: true, createdAt: true, lastLoginAt: true } }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'blocked' } }),
      prisma.user.count({ where: { createdAt: { gte: firstDay } } }),
    ])
    return NextResponse.json({ users: { data: items, total }, stats: { total, active, blocked, newThisMonth } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
