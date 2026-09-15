import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit
    
    // Filters
    const type = searchParams.get('type') // 'image' or 'video'
    const category = searchParams.get('category')
    const destinationId = searchParams.get('destinationId')
    
    const where = {
      isActive: true,
    }
    
    if (type) {
      where.type = type
    }
    if (category) {
      where.galleryCategory = { slug: category }
    }
    if (destinationId) {
      where.destinationId = parseInt(destinationId)
    }

    // Fetch data
    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        include: {
          galleryCategory: { select: { name: true, slug: true } },
          destination: { select: { name: true, slug: true } }
        },
        orderBy: { captureDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.gallery.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: galleries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('[API Galleries GET]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
