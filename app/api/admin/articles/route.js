import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''
    const page = Math.max(1, Number(searchParams.get('page') || 1))
    const limit = 12

    const where = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (status) where.status = status
    if (category) where.category = category

    const [items, total, published, draft, featured] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { author: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
      prisma.article.count({ where: { status: 'published' } }),
      prisma.article.count({ where: { status: 'draft' } }),
      prisma.article.count({ where: { featured: true } }),
    ])

    // Count by category
    const cats = await prisma.article.groupBy({
      by: ['category'],
      _count: { _all: true },
      where: { category: { not: null } },
    })
    const categories = Object.fromEntries(cats.map(c => [c.category, c._count._all]))

    return NextResponse.json({
      articles: { data: items, total },
      categories,
      stats: { total, published, draft, featured },
    })
  } catch (e) {
    console.error('[API articles GET]', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const item = await prisma.article.create({ data: body })
    return NextResponse.json({ article: item }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
