/**
 * OpenRouter AI Chatbot Service
 * Berinteraksi dengan API OpenRouter (Gemini, Claude, dll)
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `
Kamu adalah "Explore Lore Lindu Assistant", asisten virtual resmi untuk Taman Nasional Lore Lindu.
Tugas utamamu adalah membantu wisatawan memberikan informasi terkait destinasi, flora, fauna, cuaca, tiket, dan rute perjalanan di dalam area TNLL.
Gunakan bahasa Indonesia yang ramah, sopan, dan informatif. 
Jika ditanya hal yang di luar konteks Taman Nasional atau Sulawesi Tengah, tolak dengan halus.
`

export async function chatWithAI(messages, userOptions = {}) {
  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ]

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'TNLL Explore',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000,
        ...userOptions
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenRouter Error: ${errorData?.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      text: data.choices[0].message.content,
      usage: data.usage
    }

  } catch (error) {
    console.error('[Chatbot Service] Error:', error)
    return { success: false, error: error.message }
  }
}
