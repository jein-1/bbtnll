import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const siteInfo = await prisma.siteInfo.findFirst()
    return NextResponse.json({ siteInfo })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const existing = await prisma.siteInfo.findFirst()
    let siteInfo
    if (existing) {
      siteInfo = await prisma.siteInfo.update({ where: { id: existing.id }, data: body })
    } else {
      siteInfo = await prisma.siteInfo.create({ data: body })
    }
    return NextResponse.json({ siteInfo })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
