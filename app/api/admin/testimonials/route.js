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
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { comment: { contains: search, mode: 'insensitive' } }]
    if (status) where.status = status
    const [items, total, approved, pending] = await Promise.all([
      prisma.testimonial.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.testimonial.count({ where }),
      prisma.testimonial.count({ where: { status: 'approved' } }),
      prisma.testimonial.count({ where: { status: 'pending' } }),
    ])
    return NextResponse.json({ testimonials: { data: items, total }, stats: { total, approved, pending } })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
