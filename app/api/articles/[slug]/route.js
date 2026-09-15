import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = params

    const article = await prisma.article.findUnique({
      where: { 
        slug: slug,
        isPublished: true,
      },
      include: {
        user: { select: { name: true, avatar: true } },
        tags: { select: { tag: { select: { name: true, slug: true } } } },
        _count: { select: { comments: { where: { isVisible: true } } } }
      }
    })

    if (!article || (article.publishedAt && new Date(article.publishedAt) > new Date())) {
      return NextResponse.json(
        { success: false, message: 'Artikel tidak ditemukan' },
        { status: 404 }
      )
    }

    // Format tags
    const formattedArticle = {
      ...article,
      tags: article.tags.map(t => t.tag)
    }

    // Background view count increment
    prisma.article.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } }
    }).catch(err => console.error('[API Article View Increment]', err))

    return NextResponse.json({
      success: true,
      data: formattedArticle
    })
  } catch (error) {
    console.error('[API Article Slug GET]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
