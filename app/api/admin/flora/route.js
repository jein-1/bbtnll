import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 15
    const where = {}
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { latinName: { contains: search, mode: 'insensitive' } }]
    const [items, total] = await Promise.all([
      prisma.flora.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.flora.count({ where }),
    ])
    return NextResponse.json({ flora: { data: items, total }, stats: { total } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const item = await prisma.flora.create({ data: body })
    return NextResponse.json({ item }, { status: 201 })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
