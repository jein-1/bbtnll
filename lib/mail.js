import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

/**
 * Mengirim email menggunakan Nodemailer (mengganti BrevoMailService)
 * @param {string|string[]} to - Alamat penerima
 * @param {string} subject - Subjek email
 * @param {string} html - Konten HTML email
 */
export async function sendMail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('[Mail Service] Error sending email:', error)
    return { success: false, error: error.message }
  }
}
