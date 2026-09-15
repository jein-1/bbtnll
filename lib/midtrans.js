// Midtrans Payment Service
// Mengganti app/Services/Midtrans/MidtransService.php

import midtransClient from 'midtrans-client'

// ─── Snap Client (untuk token pembayaran) ─────────────────────────────────────
export const snapClient = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

// ─── Core API Client (untuk pengecekan status) ────────────────────────────────
export const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
})

/**
 * Buat Snap Token untuk pembayaran baru
 * @param {object} booking - data booking dari DB
 * @param {object} destination - data destinasi dari DB
 * @returns {Promise<{token: string, redirectUrl: string}>}
 */
export async function createSnapToken(booking, destination) {
  const parameter = {
    transaction_details: {
      order_id: booking.orderNumber,
      gross_amount: Number(booking.totalAmount),
    },
    customer_details: {
      first_name: booking.leaderName,
      email: booking.leaderEmail,
      phone: booking.leaderPhone,
    },
    item_details: booking.items.map((item) => ({
      id: String(item.destinationPriceId),
      price: Number(item.unitPrice),
      quantity: item.quantity,
      name: `${item.label} - ${destination.name}`,
    })),
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.orderNumber}/success`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.orderNumber}/payment`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.orderNumber}/payment`,
    },
  }

  const transaction = await snapClient.createTransaction(parameter)
  return {
    token: transaction.token,
    redirectUrl: transaction.redirect_url,
  }
}

/**
 * Verifikasi notifikasi webhook dari Midtrans
 * @param {object} notification - body dari webhook Midtrans
 * @returns {Promise<object>} - status transaksi yang terverifikasi
 */
export async function verifyNotification(notification) {
  const statusResponse = await coreApi.transaction.notification(notification)
  return statusResponse
}

/**
 * Cek status transaksi di Midtrans
 * @param {string} orderId
 */
export async function checkTransactionStatus(orderId) {
  return await coreApi.transaction.status(orderId)
}

/**
 * Map status Midtrans ke status payment internal
 */
export function mapPaymentStatus(midtransStatus, fraudStatus) {
  if (midtransStatus === 'capture') {
    return fraudStatus === 'challenge' ? 'challenge' : 'success'
  }
  const statusMap = {
    settlement: 'success',
    pending: 'pending',
    deny: 'failed',
    expire: 'expired',
    cancel: 'failed',
    refund: 'refunded',
  }
  return statusMap[midtransStatus] || 'pending'
}
