import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    // Filters
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const isFeatured = searchParams.get('featured') === 'true'

    // Build where clause
    const where = {
      isActive: true,
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } }
      ]
    }
    if (category) {
      where.category = { slug: category }
    }
    if (isFeatured) {
      where.isFeatured = true
    }

    // Fetch data
    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          images: {
            where: { isPrimary: true },
            select: { imagePath: true, altText: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.destination.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: destinations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('[API Destinations GET]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
