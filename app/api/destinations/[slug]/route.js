import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { slug } = params

    // Fetch detail destinasi
    const destination = await prisma.destination.findUnique({
      where: { 
        slug: slug,
        isActive: true
      },
      include: {
        category: { select: { name: true, slug: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, imagePath: true, altText: true, isPrimary: true }
        },
        prices: {
          where: { isActive: true },
          select: { id: true, category: true, label: true, price: true, weekendPrice: true }
        }
      }
    })

    if (!destination) {
      return NextResponse.json(
        { success: false, message: 'Destinasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Background update view count (tidak perlu di-await agar response cepat)
    prisma.destination.update({
      where: { id: destination.id },
      data: { viewsCount: { increment: 1 } }
    }).catch(err => console.error('[API Destination View Increment]', err))

    return NextResponse.json({
      success: true,
      data: destination
    })
  } catch (error) {
    console.error('[API Destination Slug GET]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
