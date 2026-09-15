import QRCode from 'qrcode'

/**
 * Generate QR Code data URL (base64 image)
 * @param {string} text - Teks atau URL yang akan dienkode
 * @returns {Promise<string>} Base64 image data URL
 */
export async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff', // white
      },
    })
  } catch (error) {
    console.error('[QR Code Service] Error generating QR code:', error)
    return null
  }
}

/**
 * Validasi token tiket berdasarkan format hash
 * @param {string} ticketCode - Kode tiket dari DB
 * @param {string} hash - Hash dari QR code scanner
 */
export function validateTicketHash(ticketCode, hash) {
  // Logika verifikasi sederhana (bisa disesuaikan dengan JWT jika perlu keamanan ekstra)
  // Di Laravel sebelumnya menggunakan custom hash check
  return ticketCode === hash
}
