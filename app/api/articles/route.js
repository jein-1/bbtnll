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
    const tag = searchParams.get('tag')
    
    const where = {
      isPublished: true,
      publishedAt: { lte: new Date() }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } }
      ]
    }
    if (category) {
      where.category = category
    }
    if (tag) {
      where.tags = {
        some: { tag: { slug: tag } }
      }
    }

    // Fetch data
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          publishedAt: true,
          readingTime: true,
          viewsCount: true,
          authorName: true,
          tags: {
            select: { tag: { select: { name: true, slug: true } } }
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where })
    ])

    // Flatten tags for easier frontend consumption
    const formattedArticles = articles.map(article => ({
      ...article,
      tags: article.tags.map(t => t.tag)
    }))

    return NextResponse.json({
      success: true,
      data: formattedArticles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('[API Articles GET]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
