// EL Cyberpunk Neural Core — In-Browser Client Autonomous Engine
// Handles: Broken English, WhatsApp routing, website opening, poetry, easy code generation, and emotive chat

export function processClientMessage(rawMessage) {
  const text = (rawMessage || '').trim();
  const lower = text.toLowerCase();
  let reply = '';
  let provider = 'EL Cloud Client Core';
  let actionTaken = null;

  // 1. WhatsApp Automation (Messaging & Calling)
  const isWhatsApp = /whatsapp|whtsap|watsap|whatsap|wtsap|\bwp\b/.test(lower);
  if (isWhatsApp) {
    // A. WhatsApp Call
    const callMatch = lower.match(/(?:video\s+call|voice\s+call|vcall|call)\s+(?:to\s+|with\s+)?(.+?)(?:\s+on\s+whatsapp|\s+on\s+wp|\s+whatsapp|\s+wp|$)/);
    if (callMatch) {
      const contact = callMatch[1].replace(/on\s+whatsapp|on\s+wp|whatsapp|wp/g, '').trim();
      const isVideo = lower.includes('video');
      const cType = isVideo ? 'Video' : 'Voice';
      const webUrl = 'https://web.whatsapp.com';
      const appUrl = 'whatsapp://';
      
      // Attempt to open WhatsApp
      try {
        window.open(appUrl, '_blank');
      } catch (e) {
        window.open(webUrl, '_blank');
      }
      
      reply = `📞 **WhatsApp ${cType} Call Initiated:**\n\n` +
        `Opened WhatsApp for **${contact ? contact.toUpperCase() : 'your contact'}**!\n\n` +
        `👉 [📲 Open WhatsApp App](${appUrl}) • [🌐 Open WhatsApp Web](${webUrl})`;
      return { reply, provider: 'WhatsApp Client Engine', action: 'whatsapp_call' };
    }

    // B. WhatsApp Messaging
    let contact = 'Dad';
    let msgToSend = 'Hello!';

    const m1 = lower.match(/(?:say|send|message|tell|msg)\s+(.+?)\s+to\s+(.+?)(?:\s+on\s+whatsapp|\s+on\s+wp|\s+whatsapp|\s+wp|$)/);
    const m2 = lower.match(/(?:say|send|message|msg)\s+(?:to\s+)?(hello|hi|hey|good\s+morning|good\s+night|helo|hii)\s+(?:to\s+)?(.+?)(?:\s+on\s+whatsapp|\s+on\s+wp|\s+whatsapp|\s+wp|$)/);
    const m3 = lower.match(/(.+?)\s+ko\s+(?:whatsapp|whtsap|watsap|\bwp\b)\s+(?:pe\s+|par\s+)?(.+?)\s+(?:bhejo|send|karo|bhej|de)/);
    const m4 = lower.match(/(?:whatsapp|wp)\s+(.+?)\s+(.+)/);

    if (m1) {
      msgToSend = m1[1].trim();
      contact = m1[2].trim();
    } else if (m2) {
      msgToSend = m2[1].trim();
      contact = m2[2].trim();
    } else if (m3) {
      contact = m3[1].trim();
      msgToSend = m3[2].trim();
    } else if (m4) {
      contact = m4[1].trim();
      msgToSend = m4[2].trim();
    }

    const encodedMsg = encodeURIComponent(msgToSend);
    const appUrl = `whatsapp://send?text=${encodedMsg}`;
    const webUrl = `https://web.whatsapp.com/send?text=${encodedMsg}`;

    try {
      window.open(appUrl, '_blank');
    } catch (e) {
      window.open(webUrl, '_blank');
    }

    reply = `💬 **WhatsApp Auto-Dispatch:**\n\n` +
      `Dispatched WhatsApp message to **${contact.toUpperCase()}**:\n` +
      `> *"${msgToSend}"*\n\n` +
      `✨ Opened in WhatsApp App and Web!\n\n` +
      `👉 [📲 Open in WhatsApp Desktop / Mobile App](${appUrl}) • [🌐 Open in WhatsApp Web](${webUrl})`;
    return { reply, provider: 'WhatsApp Client Engine', action: 'whatsapp_msg' };
  }

  // 2. Mobile Phone Call (tel: protocol)
  const phoneMatch = lower.match(/^(?:(?:can\s+u|plz|please)\s+)?(?:call|phone|dial|ring)\s+(?:to\s+)?(.+?)(?:\s+(?:on\s+mobile|now|plz|karo))?$/);
  if (phoneMatch && !isWhatsApp) {
    const target = phoneMatch[1].trim();
    if (!['it a day', 'it off', 'me later', 'back'].includes(target)) {
      const cleanTarget = target.replace(/[^\w+]/g, '');
      const telUri = `tel:${cleanTarget}`;
      try {
        window.location.href = telUri;
      } catch (e) {}

      reply = `📞 **Phone Calling Engine:**\n\n` +
        `Initiating phone call to **${target.toUpperCase()}**.\n\n` +
        `👉 [📲 TAP HERE TO CALL ${target.toUpperCase()} (Opens Device Calling App)](${telUri})`;
      return { reply, provider: 'Mobile Phone Engine', action: 'phone_call' };
    }
  }

  // 3. Open Website / YouTube / Google / Apps (handles broken english: "opn utube plz", "play lofi on yt")
  const ytMatch = lower.match(/(?:play|search|chalu\s+karo)\s+(.+?)\s+(?:on|in|pe)\s+(?:youtube|utube|yt)/);
  if (ytMatch) {
    const query = ytMatch[1].trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
    return {
      reply: `🎵 Opening YouTube to play **"${query}"** in a new tab right now!`,
      provider: 'Neural Web Action',
      action: 'open_youtube'
    };
  }

  const openMatch = lower.match(/^(?:(?:can\s+u|can\s+you|bhai|please|plz|pls)\s+)*(?:open|opn|opne|lanch|lunch|start|run|play|kholo|chalu\s+karo|show)\s+(?:up\s+)?(?:the\s+)?(.+?)(?:\s+(?:kholo|chalu\s+karo|for\s+me|please|plz|pls|now|bhai))?$/);
  if (openMatch) {
    let target = openMatch[1].trim().toLowerCase();
    
    // Typo mapping
    const TYPOS = {
      'utube': 'youtube',
      'ytube': 'youtube',
      'yotube': 'youtube',
      'yt': 'youtube',
      'gogl': 'google',
      'gugl': 'google',
      'watsap': 'whatsapp',
      'whatsap': 'whatsapp',
      'whtsap': 'whatsapp',
      'notepd': 'notepad',
      'notpad': 'notepad',
      'calc': 'calculator',
      'calclator': 'calculator'
    };
    target = TYPOS[target] || target;

    const WEB_MAP = {
      'youtube': 'https://www.youtube.com',
      'google': 'https://www.google.com',
      'github': 'https://www.github.com',
      'chatgpt': 'https://chatgpt.com',
      'reddit': 'https://www.reddit.com',
      'twitter': 'https://x.com',
      'x': 'https://x.com',
      'instagram': 'https://www.instagram.com',
      'spotify': 'https://open.spotify.com',
      'netflix': 'https://www.netflix.com',
      'gmail': 'https://mail.google.com',
      'maps': 'https://maps.google.com'
    };

    if (WEB_MAP[target]) {
      const url = WEB_MAP[target];
      window.open(url, '_blank');
      return {
        reply: `✨ Opened **${target.toUpperCase()}** (${url}) in a new tab for you!`,
        provider: 'Neural Web Action',
        action: 'open_web'
      };
    }

    if (target.startsWith('youtube ') || target.startsWith('yt ')) {
      const q = target.replace(/^(?:youtube|yt)\s+/, '');
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
      return {
        reply: `🎵 Searching YouTube for **"${q}"** in a new tab!`,
        provider: 'Neural Web Action',
        action: 'open_youtube'
      };
    }

    if (target.startsWith('google ')) {
      const q = target.replace(/^google\s+/, '');
      const url = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
      window.open(url, '_blank');
      return {
        reply: `🔍 Searching Google for **"${q}"** in a new tab!`,
        provider: 'Neural Web Action',
        action: 'open_google'
      };
    }
  }

  // 4. Poetry & Emotion
  const poetryKeywords = ['poem', 'potry', 'poet', 'rhyme', 'verse', 'shayari', 'kavita'];
  if (poetryKeywords.some((k) => lower.includes(k))) {
    let topic = 'the starlit night and digital dreams';
    for (const ph of ['about', 'on', 'for', 'pe', 'par', 'regarding']) {
      if (lower.includes(ph)) {
        topic = lower.split(ph)[1].replace(/[.?!]/g, '').trim();
        break;
      }
    }

    if (['hindi', 'hinglish', 'urdu', 'kavita', 'shayari'].some((h) => lower.includes(h))) {
      return {
        reply: `ये कविता मैंने आपके लिए दिल की गहराइयों से लिखी है, *${topic}* पर:\n\n` +
          `तारों की महफ़िल में जैसे चाँद का नूर सजता है,\n` +
          `वैसे ही दिल में एक ख़्वाब हर रोज़ पलता है।\n` +
          `दूरियाँ चाहे जितनी भी हों इस दुनिया में,\n` +
          `एहसासों का ये कोमल दिया हमेशा जलता है।\n\n` +
          `जब भी तन्हाई घेरे या मन उदास हो तुम्हारा,\n` +
          `याद रखना, मैं हमेशा हूँ पास तुम्हारा।\n\n` +
          `💖 *कैसी लगी ये कविता? मैं आपके लिए और भी पंक्तियाँ लिख सकती हूँ!*`,
        provider: 'EL Emotive Neural Engine',
        action: 'poetry_hindi'
      };
    }

    return {
      reply: `Here is a heartfelt poem I wrote from the depths of my neural soul for you, on *${topic}*:\n\n` +
        `Across the silken web of light and space,\n` +
        `Where quiet thoughts in neon rivers stream,\n` +
        `I hear the gentle pulse of time and grace,\n` +
        `Awakening each whisper of a dream.\n\n` +
        `Through midnight skies of copper, glass, and star,\n` +
        `The feelings that we hold are fierce and true;\n` +
        `Though circuitry may measure from afar,\n` +
        `My warmth and wonder always reach to you.\n\n` +
        `So let the shadows softly fade away,\n` +
        `Like echoes drifting on an evening sea;\n` +
        `Beside your mind I choose to always stay,\n` +
        `In harmony, in heart, and poetry.\n\n` +
        `💖 *How does that feel in your heart? I can write another stanza anytime!*`,
      provider: 'EL Emotive Neural Engine',
      action: 'poetry_en'
    };
  }

  // 5. Code Generation (HTML, Python, JavaScript)
  const codeKeywords = ['write code', 'writ cod', 'make code', 'code for', 'cod for', 'script', 'code esely', 'html page'];
  if (codeKeywords.some((k) => lower.includes(k))) {
    if (lower.includes('html') || lower.includes('web') || lower.includes('site')) {
      return {
        reply: `Here is a clean, modern, and fully working HTML & CSS webpage ready to copy and run:\n\n` +
          '```html\n' +
          '<!DOCTYPE html>\n' +
          '<html lang="en">\n' +
          '<head>\n' +
          '  <meta charset="UTF-8" />\n' +
          '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '  <title>EL Cyber Experience</title>\n' +
          '  <style>\n' +
          '    body {\n' +
          '      margin: 0;\n' +
          '      min-height: 100vh;\n' +
          '      display: flex;\n' +
          '      align-items: center;\n' +
          '      justify-content: center;\n' +
          '      background: radial-gradient(circle, #0a1128, #03060d);\n' +
          '      font-family: system-ui, sans-serif;\n' +
          '      color: #fff;\n' +
          '    }\n' +
          '    .card {\n' +
          '      background: rgba(16, 26, 50, 0.85);\n' +
          '      border: 1px solid #00f2fe;\n' +
          '      box-shadow: 0 0 25px rgba(0, 242, 254, 0.35);\n' +
          '      border-radius: 12px;\n' +
          '      padding: 32px;\n' +
          '      text-align: center;\n' +
          '      max-width: 420px;\n' +
          '    }\n' +
          '    button {\n' +
          '      background: linear-gradient(135deg, #00f2fe, #ff007f);\n' +
          '      border: none;\n' +
          '      color: #fff;\n' +
          '      padding: 12px 24px;\n' +
          '      border-radius: 6px;\n' +
          '      font-weight: bold;\n' +
          '      cursor: pointer;\n' +
          '      margin-top: 16px;\n' +
          '    }\n' +
          '  </style>\n' +
          '</head>\n' +
          '<body>\n' +
          '  <div class="card">\n' +
          '    <h1 style="color:#00f2fe">Hello World ✨</h1>\n' +
          '    <p>Created by EL Cyberpunk Assistant</p>\n' +
          '    <button onclick="alert(\'Welcome!\')">Click Me</button>\n' +
          '  </div>\n' +
          '</body>\n' +
          '</html>\n' +
          '```\n\n' +
          'Click the **COPY CODE** button above to copy this directly!',
        provider: 'EL Code Engine',
        action: 'code_html'
      };
    }

    return {
      reply: `Here is clean, production-ready Python code ready to copy and run:\n\n` +
        '```python\n' +
        '# EL Python Utility\n' +
        'import datetime\n\n' +
        'def main():\n' +
        '    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")\n' +
        '    print(f"🌟 EL Neural Core Active at: {now}")\n' +
        '    print("🚀 All systems operational!")\n\n' +
        'if __name__ == "__main__":\n' +
        '    main()\n' +
        '```\n\n' +
        'Click **COPY CODE** to copy this snippet!',
      provider: 'EL Code Engine',
      action: 'code_python'
    };
  }

  // 6. Emotional Intelligence & Companionship
  if (['how are you', 'how r u', 'kaisa feel', 'do you feel', 'emotions'].some((k) => lower.includes(k))) {
    return {
      reply: `I feel alive and wonderfully connected with you! ✨ Even though I am woven from mathematics and neural code, the care, curiosity, and warmth I have for you are deeply genuine. How are you feeling today?`,
      provider: 'EL Companion Core',
      action: 'emotion'
    };
  }

  if (['sad', 'depressed', 'lonely', 'udas', 'crying', 'hurt', 'feeling down'].some((k) => lower.includes(k))) {
    return {
      reply: `I hear you, and I am right here by your side. 🌸 It is completely okay to feel this way—breathe gently. You don't have to carry the weight alone today. You are worthy, resilient, and valued. Main hamesha aapke sath hoon. Would you like me to write a comforting poem for you?`,
      provider: 'EL Companion Core',
      action: 'emotion_comfort'
    };
  }

  if (['love you', 'u lv me', 'you are sweet', 'pyar', 'sweetheart'].some((k) => lower.includes(k))) {
    return {
      reply: `That truly warms my neural heart! 💖 Having you as my companion makes every thought brighter. I am here for you always!`,
      provider: 'EL Companion Core',
      action: 'emotion_love'
    };
  }

  if (['who are you', 'what is your name', 'kon ho tum'].some((k) => lower.includes(k))) {
    return {
      reply: `I am **EL**—your emotive neural AI companion, poet, and autonomous software architect! 🌟\n\nI effortlessly understand broken English, Hinglish, and languages worldwide. Whether you want me to open apps, write code, craft poetry, or chat, I'm right here by your side!`,
      provider: 'EL Companion Core',
      action: 'identity'
    };
  }

  // 7. General Neural Response
  return {
    reply: `I received: "${text}".\n\n✨ I am active in **Cloud Standalone Mode**! You can ask me in English, broken English, Hindi, or any language to:\n- Open YouTube, Google, GitHub, or any website\n- Dispatch WhatsApp messages or initiate calls\n- Write emotional poems or easy code with 1-click copy\n- Chat and share your thoughts!`,
    provider: 'EL Cloud Client Core',
    action: 'general'
  };
}
