import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSnapToken } from '@/lib/midtrans'
import { auth } from '@/lib/auth'

export async function POST(request) {
  try {
    const session = await auth()
    const body = await request.json()
    
    // Basic validation
    const { 
      destinationId, visitDate, leaderName, leaderPhone, leaderEmail, 
      tickets // Array of { destinationPriceId, quantity }
    } = body

    if (!destinationId || !visitDate || !leaderName || !leaderPhone || !leaderEmail || !tickets || tickets.length === 0) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 })
    }

    // Ambil detail destinasi dan harga yang valid
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: { prices: true }
    })

    if (!destination) {
      return NextResponse.json({ success: false, message: 'Destinasi tidak ditemukan' }, { status: 404 })
    }

    // Hitung total dan buat booking items
    let subtotal = 0
    let totalVisitors = 0
    const bookingItemsData = []

    for (const ticket of tickets) {
      const priceDb = destination.prices.find(p => p.id === ticket.destinationPriceId)
      if (!priceDb) continue

      const isWeekend = new Date(visitDate).getDay() === 0 || new Date(visitDate).getDay() === 6
      const unitPrice = isWeekend && priceDb.weekendPrice ? priceDb.weekendPrice : priceDb.price
      const totalPrice = unitPrice * ticket.quantity
      
      subtotal += Number(totalPrice)
      if (['Dewasa', 'Anak', 'Mancanegara'].includes(priceDb.label)) {
        totalVisitors += ticket.quantity
      }

      bookingItemsData.push({
        destinationPriceId: priceDb.id,
        category: priceDb.category,
        label: priceDb.label,
        quantity: ticket.quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      })
    }

    if (totalVisitors === 0) {
      return NextResponse.json({ success: false, message: 'Minimal harus ada 1 pengunjung' }, { status: 400 })
    }

    const serviceFee = 2000 // Rp 2.000 platform fee (contoh)
    const totalAmount = subtotal + serviceFee

    // Generate Order Number unik (TNLL-YYYYMMDD-RandomHex)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomHex = Math.random().toString(16).slice(2, 8).toUpperCase()
    const orderNumber = `TNLL-${dateStr}-${randomHex}`

    // Simpan Booking ke DB (Transaksional)
    const booking = await prisma.booking.create({
      data: {
        orderNumber,
        userId: session?.user?.id ? parseInt(session.user.id) : null,
        destinationId: destination.id,
        visitDate: new Date(visitDate),
        leaderName,
        leaderPhone,
        leaderEmail,
        totalVisitors,
        subtotal,
        serviceFee,
        totalAmount,
        status: 'pending',
        items: {
          create: bookingItemsData
        },
        payment: {
          create: {
            orderId: orderNumber,
            grossAmount: totalAmount,
            status: 'pending'
          }
        }
      },
      include: { items: true }
    })

    // Buat token pembayaran Midtrans (menggunakan Sandbox sesuai kesepakatan)
    const snap = await createSnapToken(booking, destination)
    
    // Update booking dengan snap token
    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: { snapToken: snap.token }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibuat',
      data: {
        orderNumber: booking.orderNumber,
        snapToken: snap.token,
        redirectUrl: snap.redirectUrl
      }
    })

  } catch (error) {
    console.error('[API Booking POST]', error)
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
