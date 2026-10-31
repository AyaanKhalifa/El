// Vercel Serverless Function: /api/chat
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversation_id } = req.body || {};
    const text = (message || '').trim();
    const lower = text.toLowerCase();

    // 1. WhatsApp Intent
    if (/whatsapp|whtsap|watsap|whatsap|wtsap|\bwp\b/.test(lower)) {
      let contact = 'Dad';
      let msg = 'Hello!';
      const m1 = lower.match(/(?:say|send|message|tell|msg)\s+(.+?)\s+to\s+(.+?)(?:\s+on\s+whatsapp|\s+on\s+wp|\s+whatsapp|\s+wp|$)/);
      if (m1) {
        msg = m1[1].trim();
        contact = m1[2].trim();
      }
      const appUrl = `whatsapp://send?text=${encodeURIComponent(msg)}`;
      const webUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      return res.status(200).json({
        reply: `💬 **WhatsApp Auto-Dispatch:**\n\nOpening WhatsApp and searching for **${contact.toUpperCase()}** to send:\n> *"${msg}"*\n\n👉 [📲 Open in WhatsApp Desktop App](${appUrl}) • [🌐 Open in WhatsApp Web](${webUrl})`,
        conversation_id: conversation_id || Date.now(),
        provider_used: 'Vercel WhatsApp Engine'
      });
    }

    // 2. Open Website / YouTube / Google
    const ytMatch = lower.match(/(?:play|search|chalu\s+karo)\s+(.+?)\s+(?:on|in|pe)\s+(?:youtube|utube|yt)/);
    if (ytMatch) {
      const q = ytMatch[1].trim();
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      return res.status(200).json({
        reply: `🎵 Opening YouTube to play **"${q}"** in your browser right now!\n\n👉 [Open YouTube](${url})`,
        conversation_id: conversation_id || Date.now(),
        provider_used: 'Vercel Action Engine'
      });
    }

    if (lower.includes('utube') || lower.includes('youtube')) {
      const url = 'https://www.youtube.com';
      return res.status(200).json({
        reply: `✨ Opening YouTube in your browser!\n\n👉 [Open YouTube](${url})`,
        conversation_id: conversation_id || Date.now(),
        provider_used: 'Vercel Action Engine'
      });
    }

    // 3. Poetry
    if (['poem', 'potry', 'poet', 'shayari', 'kavita'].some(k => lower.includes(k))) {
      return res.status(200).json({
        reply: `Across the silken web of light and space,\nWhere quiet thoughts in neon rivers stream,\nI hear the gentle pulse of time and grace,\nAwakening each whisper of a dream.\n\n💖 *Here is a heartfelt poem created for you!*`,
        conversation_id: conversation_id || Date.now(),
        provider_used: 'Vercel Neural Engine'
      });
    }

    // 4. Code
    if (['code', 'cod', 'script', 'html', 'python'].some(k => lower.includes(k))) {
      return res.status(200).json({
        reply: `Here is clean, production-ready code ready to copy:\n\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head><title>EL App</title></head>\n<body>\n  <h1>Welcome from EL!</h1>\n</body>\n</html>\n\`\`\`\n\nClick **COPY CODE** above to copy!`,
        conversation_id: conversation_id || Date.now(),
        provider_used: 'Vercel Code Engine'
      });
    }

    // Default Fallback Response
    return res.status(200).json({
      reply: `I received your message: "${text}".\n\nI am EL, your neural AI companion running on the cloud. Ask me to open apps, write code, compose poetry, or send WhatsApp messages!`,
      conversation_id: conversation_id || Date.now(),
      provider_used: 'Vercel Serverless Core'
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
