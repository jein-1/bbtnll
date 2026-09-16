import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 12

    const where = {}
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]
    if (status) where.status = status

    const [items, total, active, inactive] = await Promise.all([
      prisma.destination.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.destination.count({ where }),
      prisma.destination.count({ where: { status: 'active' } }),
      prisma.destination.count({ where: { status: 'inactive' } }),
    ])
    return NextResponse.json({ destinations: { data: items, total }, stats: { total, active, inactive } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const item = await prisma.destination.create({ data: body })
    return NextResponse.json({ destination: item }, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
