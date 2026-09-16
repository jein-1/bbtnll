import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 15
    const where = {}
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }]
    const [items, total, active] = await Promise.all([
      prisma.admin.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, select: { id: true, name: true, email: true, username: true, role: true, isActive: true, createdAt: true, lastLoginAt: true } }),
      prisma.admin.count({ where }),
      prisma.admin.count({ where: { isActive: true } }),
    ])
    return NextResponse.json({ admins: { data: items, total }, stats: { total, active, inactive: total - active } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
