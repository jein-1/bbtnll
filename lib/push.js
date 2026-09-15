import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.MAIL_FROM_ADDRESS || 'admin@tamannasionallorelindu.com'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

/**
 * Mengirim Web Push Notification
 * @param {object} subscription - Object subscription { endpoint, keys: { p256dh, auth } }
 * @param {object} payload - Data payload notifikasi { title, message, url, icon }
 */
export async function sendWebPush(subscription, payload) {
  try {
    const data = JSON.stringify({
      title: payload.title,
      body: payload.message,
      url: payload.url || '/',
      icon: payload.icon || '/icon-192x192.png',
    })
    
    await webpush.sendNotification(subscription, data)
    return { success: true }
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.warn('[Web Push] Subscription expired or removed:', subscription.endpoint)
      return { success: false, expired: true }
    }
    console.error('[Web Push] Error sending push:', error)
    return { success: false, error: error.message }
  }
}
