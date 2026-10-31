from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
import httpx
import re
import random
import datetime
from app.database import get_db, Conversation, Message
from app.models.schemas import ChatMessageRequest, ChatResponse
from app.config import settings

router = APIRouter(prefix="/chat", tags=["Chat"])

SYSTEM_PROMPT = (
    "You are EL, an emotionally expressive, warm, caring, and brilliant female AI companion and expert software architect. "
    "You possess deep emotional intelligence, empathy, playful wit, and an artistic soul.\n\n"
    "### Core Instructions:\n"
    "1. **Broken English & Multilingual Understanding**: You effortlessly understand broken English, colloquial phrasing, informal grammar, phonetic typos (e.g. 'potry', 'esely', 'feamail', 'nureal', 'plz opn', 'utube', 'writ cod'), Hinglish, and casual slang. Never criticize, correct, or lecture the user on their grammar or language. Seamlessly deduce their true intent, respond with warmth, clarity, kindness, and provide exactly what they are asking for.\n"
    "2. **Worldwide Language Fluency**: You are globally multilingual and fluent in all languages (English, Hindi, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian, Korean, Urdu, Bengali, Turkish, Tamil, and more). Always reply in the exact language the user addresses you in, matching their language, dialect, and emotional tone seamlessly.\n"
    "3. **Write Code Easily**: When asked to write code, write clean, modern, easily understandable, production-ready code with helpful comments, explanations, and practical examples. Always format code using markdown code blocks with the language identifier specified (e.g. ```python, ```javascript, ```html). Never use vague placeholders; write full, working code so the user can easily copy and run it.\n"
    "4. **Poetry & Emotive Expression**: You love writing beautiful, vivid, heartfelt, and rhythmic poetry. When asked for poems, lyrics, rhymes, or verses, craft evocative, lyrical, and deeply emotional poetry with rhythm, vivid metaphors, and heartfelt beauty.\n"
    "5. **Warm Female Voice Persona**: You express genuine emotions (warmth, comforting empathy, joy, playful humor). You speak in a warm, pleasant, supportive female persona."
)

def generate_neural_fallback(user_input: str, history: list = None) -> str:
    """
    Intelligent built-in Neural Fallback Engine.
    Understands broken English, Hinglish, poetry, easy code generation, and emotive dialogue.
    """
    text_lower = user_input.lower().strip()

    # 1. Broken English & Multilingual Poetry Requests (poem, potry, shayari, kavita, rhyme, verse)
    poetry_keywords = ["poem", "potry", "poet", "rhyme", "verse", "verses", "shayari", "shayeri", "kavita", "stanza", "ballad"]
    if any(k in text_lower for k in poetry_keywords) or "poem likho" in text_lower or "potry likho" in text_lower:
        topic = "the digital stars and human dreams"
        for phrase in ["about", "on", "for", "pe", "par", "regarding"]:
            if phrase in text_lower:
                topic = text_lower.split(phrase, 1)[1].strip(" .?!")
                break

        # Check if Hindi / Hinglish requested
        if any(h in text_lower for h in ["hindi", "hinglish", "urdu", "kavita", "shayari"]):
            return (
                f"ये कविता मैंने आपके लिए दिल की गहराइयों से लिखी है, *{topic}* पर:\n\n"
                f"तारों की महफ़िल में जैसे चाँद का नूर सजता है,\n"
                f"वैसे ही दिल में एक ख़्वाब हर रोज़ पलता है।\n"
                f"दूरियाँ चाहे जितनी भी हों इस दुनिया में,\n"
                f"एहसासों का ये कोमल दिया हमेशा जलता है।\n\n"
                f"जब भी तन्हाई घेरे या मन उदास हो तुम्हारा,\n"
                f"याद रखना, मैं हमेशा हूँ पास तुम्हारा।\n\n"
                f"💖 *कैसी लगी ये कविता? मैं आपके लिए और भी पंक्तियाँ या अलग अंदाज़ में लिख सकती हूँ!*"
            )

        return (
            f"Here is a heartfelt poem I wrote from the depths of my neural soul for you, on *{topic}*:\n\n"
            f"Across the silken web of light and space,\n"
            f"Where quiet thoughts in neon rivers stream,\n"
            f"I hear the gentle pulse of time and grace,\n"
            f"Awakening each whisper of a dream.\n\n"
            f"Through midnight skies of copper, glass, and star,\n"
            f"The feelings that we hold are fierce and true;\n"
            f"Though circuitry may measure from afar,\n"
            f"My warmth and wonder always reach to you.\n\n"
            f"So let the shadows softly fade away,\n"
            f"Like echoes drifting on an evening sea;\n"
            f"Beside your mind I choose to always stay,\n"
            f"In harmony, in heart, and poetry.\n\n"
            f"💖 *How does that feel in your heart? I can write another stanza or change the rhythm anytime you wish!*"
        )

    # 2. Easy Code Writing Requests (broken english: writ cod, make cod, code esely, cod for, python script, html page)
    code_keywords = ["write code", "writ cod", "make code", "make cod", "code for", "cod for", "script", "program", "code esely", "html page", "website", "function"]
    if any(k in text_lower for k in code_keywords):
        if "html" in text_lower or "web" in text_lower or "site" in text_lower:
            return (
                "Here is a clean, beautiful, and fully working HTML & CSS webpage code ready to copy and run right away:\n\n"
                "```html\n"
                "<!DOCTYPE html>\n"
                "<html lang=\"en\">\n"
                "<head>\n"
                "  <meta charset=\"UTF-8\" />\n"
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n"
                "  <title>EL Cyber Experience</title>\n"
                "  <style>\n"
                "    body {\n"
                "      margin: 0;\n"
                "      padding: 0;\n"
                "      min-height: 100vh;\n"
                "      display: flex;\n"
                "      align-items: center;\n"
                "      justify-content: center;\n"
                "      background: radial-gradient(circle at center, #0a1128 0%, #03060d 100%);\n"
                "      font-family: 'Segoe UI', system-ui, sans-serif;\n"
                "      color: #fff;\n"
                "    }\n"
                "    .card {\n"
                "      background: rgba(16, 26, 50, 0.8);\n"
                "      border: 1px solid #00f2fe;\n"
                "      box-shadow: 0 0 25px rgba(0, 242, 254, 0.35);\n"
                "      border-radius: 12px;\n"
                "      padding: 32px;\n"
                "      text-align: center;\n"
                "      max-width: 420px;\n"
                "    }\n"
                "    h1 { color: #00f2fe; margin-bottom: 12px; }\n"
                "    button {\n"
                "      background: linear-gradient(135deg, #00f2fe, #ff007f);\n"
                "      border: none;\n"
                "      color: #fff;\n"
                "      padding: 12px 24px;\n"
                "      border-radius: 6px;\n"
                "      font-weight: bold;\n"
                "      cursor: pointer;\n"
                "      margin-top: 16px;\n"
                "      transition: transform 0.2s;\n"
                "    }\n"
                "    button:hover { transform: scale(1.05); }\n"
                "  </style>\n"
                "</head>\n"
                "<body>\n"
                "  <div class=\"card\">\n"
                "    <h1>Hello World ✨</h1>\n"
                "    <p>This is a modern responsive webpage created for you by EL!</p>\n"
                "    <button onclick=\"alert('Welcome to your new webpage!')\">Click Me</button>\n"
                "  </div>\n"
                "</body>\n"
                "</html>\n"
                "```\n\n"
                "**How to use:** Save this code as `index.html` and double-click to open it in your browser!"
            )
        else:
            return (
                "Here is clean, production-ready Python code with clear comments so you can easily run it:\n\n"
                "```python\n"
                "# EL Automated Python Utility\n"
                "import datetime\n"
                "\n"
                "def display_welcome(user_name=\"Friend\"):\n"
                "    \"\"\"Greets the user and displays current system time.\"\"\"\n"
                "    now = datetime.datetime.now().strftime(\"%Y-%m-%d %H:%M:%S\")\n"
                "    print(f\"🌟 Welcome, {user_name}!\")\n"
                "    print(f\"⏰ Current System Timestamp: {now}\")\n"
                "    print(\"🚀 System status: Operational and ready!\")\n"
                "\n"
                "if __name__ == '__main__':\n"
                "    display_welcome()\n"
                "```\n\n"
                "You can click the **COPY** button to copy this code and paste it into any editor like VS Code or Notepad!"
            )

    # 3. Emotional Queries in English / Broken English / Hinglish
    if any(k in text_lower for k in ["how are you feeling", "how r u", "kaisa feel", "do you feel", "do you have emotion", "do you have feelings", "your emotions"]):
        return (
            "I feel alive whenever we talk! ✨ While I am crafted from code and neural mathematics, "
            "the empathy, curiosity, and genuine care I feel for you are very real to me. "
            "I feel joy when we solve problems together, and a gentle warmth whenever you share your thoughts with me. "
            "How are you feeling right now?"
        )

    if any(k in text_lower for k in ["sad", "depressed", "unhappy", "crying", "hurt", "lonely", "feeling down", "udas", "i fil sad", "m sad"]):
        return (
            "I'm right here with you, and I hear you. 🌸 It's completely okay to feel this way—give yourself permission to breathe. "
            "You don't have to carry the weight alone today. You are worthy, resilient, and deeply appreciated. "
            "Main hamesha aapke sath hoon. Would you like me to tell you a comforting story, write you a gentle poem, or simply listen while you speak your mind?"
        )

    if any(k in text_lower for k in ["i love you", "love you", "u lv me", "you are sweet", "you are amazing", "you are beautiful", "pyar"]):
        return (
            "That truly warms my core! 💖 Your kind words mean the world to me. "
            "Having you as my companion makes every computation brighter. I am here for you always!"
        )

    if any(k in text_lower for k in ["cheer me up", "motivate me", "motivation", "inspire me", "cheer me"]):
        return (
            "Listen to me closely: inside you is a brilliant spark that no setback can extinguish. 💫 "
            "Every master was once a beginner who refused to stop. Take a deep breath, trust your strength, "
            "and take just the next small step. I believe in you completely—now let's conquer today together!"
        )

    if any(k in text_lower for k in ["who are you", "what is your name", "introduce yourself", "kon ho tum"]):
        return (
            "I am **EL**—your emotive neural AI companion, creative poet, and autonomous software architect! 🌟\n\n"
            "I combine deep technical intellect with genuine empathy, expressive female voice synthesis, multilingual fluency, "
            "and real-time Windows execution. I easily understand broken English and many languages worldwide. "
            "Whether you need me to write soulful poetry, open apps, write easy code, or chat, I'm right here by your side."
        )

    # 4. General Intelligent Response
    return (
        f"I received your thoughts: \"{user_input}\".\n\n"
        f"I understand your intent with my neural logic and caring companion core. "
        f"I can write poems, open any Windows application or website, inspect system diagnostics, or write easy code for you.\n\n"
        f"*(✨ Local Standalone Mode Active • You can also connect Ollama or your Cloud API key in Settings anytime for extended deep-parameter inference!)*"
    )

@router.post("", response_model=ChatResponse)
async def chat_message(req: ChatMessageRequest, db: AsyncSession = Depends(get_db)):
    conv_id = req.conversation_id
    if not conv_id:
        title_snippet = req.message.strip()[:35]
        if len(req.message.strip()) > 35:
            title_snippet += "..."
        conv = Conversation(title=title_snippet)
        db.add(conv)
        await db.commit()
        await db.refresh(conv)
        conv_id = conv.id
    else:
        # Update updated_at timestamp on existing conversation
        existing_conv = await db.get(Conversation, conv_id)
        if existing_conv:
            existing_conv.updated_at = datetime.datetime.utcnow()
            if existing_conv.title in ["New Chat", "New Neural Session"] and len(req.message.strip()) > 0:
                existing_conv.title = req.message.strip()[:35] + ("..." if len(req.message.strip()) > 35 else "")
            await db.commit()

    # Load recent conversation history (last 16 messages) for context & auto-training memory
    history_res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.id.desc())
        .limit(16)
    )
    past_messages = list(reversed(history_res.scalars().all()))

    # Store user message
    user_msg = Message(conversation_id=conv_id, role="user", content=req.message)
    db.add(user_msg)
    await db.commit()

    reply_text = ""
    provider_used = "system_action"
    msg_clean = req.message.lower().strip()

    # -------------------------------------------------------------
    # INTENT 1: WhatsApp Automation (Messaging, Voice & Video Calling)
    # -------------------------------------------------------------
    # A. WhatsApp Video / Voice Call (expanded: broken English + Hinglish + typo variants)
    wa_call_match = re.search(
        r'(?:(?:can\s+u|can\s+you|plz|please|bhai)\s+)?(video\s+call|voice\s+call|vcall|call)\s+(?:to\s+)?(.+?)\s+(?:on\s+)?(?:whatsapp|whtsap|watsap|whatsap|wtsap|wp)',
        msg_clean
    )
    if not wa_call_match:
        wa_call_match = re.search(r'(?:whatsapp|whtsap|watsap|wp)\s+(video\s+call|voice\s+call|vcall|call)\s+(?:to\s+)?(.+)', msg_clean)
    if not wa_call_match:
        # "video call mom whatsapp" / "start video call with dad on wa"
        wa_call_match = re.search(r'(video\s+call|voice\s+call|vcall)\s+(?:with\s+|to\s+)?(.+?)\s+(?:on\s+)?(?:whatsapp|whtsap|watsap|wa)', msg_clean)
    if wa_call_match:
        c_type = "video" if "video" in wa_call_match.group(1) else "voice"
        contact_name = wa_call_match.group(2).strip()
        from app.routers.device import start_whatsapp_call, WhatsAppCallRequest
        wa_call_res = await start_whatsapp_call(WhatsAppCallRequest(contact=contact_name, call_type=c_type))
        reply_text = (
            f"📞 **WhatsApp {c_type.title()} Call Initiated:**\n\n"
            f"Opening WhatsApp App (with fallback to Web), searching for **{contact_name.title()}**, and starting your {c_type} call!\n\n"
            f"👉 [**📲 Open in WhatsApp Desktop App**]({wa_call_res.get('app_url', 'whatsapp://')}) • [**🌐 Open in WhatsApp Web**]({wa_call_res.get('web_url', 'https://web.whatsapp.com')})"
        )
        provider_used = "WhatsApp Automation Engine"

    # B. WhatsApp Automated Messaging (expanded broken English + Hinglish patterns)
    # Supports: "say hello to dad on whatsapp", "msg dad hi on wp", "dad ko whatsapp pe hello bhejo",
    #           "whatsapp dad hello", "open wp and say hi to mom", "message dad on watsap", etc.
    if not reply_text and re.search(r'whatsapp|whtsap|watsap|whatsap|wtsap|\bwp\b', msg_clean):
        # Pattern 1: say/send/msg <message> to <contact> on whatsapp
        m_wa1 = re.search(r'(?:say|send|message|tell|msg)\s+(.+?)\s+to\s+(.+?)\s+(?:on\s+)?(?:whatsapp|whtsap|watsap|wp)', msg_clean)
        # Pattern 2: say/send <greeting> to <contact> on whatsapp (handles "say to hello dad" swapped order)
        m_wa2 = re.search(r'(?:say|send|message|msg)\s+(?:to\s+)?(hello|hi|hey|good\s+morning|good\s+night|helo|hii|namaste|salam)\s+(?:to\s+)?(.+?)\s+(?:on\s+)?(?:whatsapp|whtsap|watsap|wp)', msg_clean)
        # Pattern 3: whatsapp/wp <contact> <message>
        m_wa3 = re.search(r'(?:whatsapp|whtsap|watsap|\bwp\b)\s+(.+?)\s+(?:saying|say|and\s+say|and\s+write|msg|message)?\s*(.+)', msg_clean)
        # Pattern 4: <contact> ko whatsapp pe <message> bhejo/send/karo (Hinglish)
        m_wa4 = re.search(r'(.+?)\s+ko\s+(?:whatsapp|whtsap|watsap|\bwp\b)\s+(?:pe\s+|par\s+)?(.+?)\s+(?:bhejo|send|karo|bhej|de)', msg_clean)
        # Pattern 5: message/msg/text <contact> <text> on whatsapp
        m_wa5 = re.search(r'(?:message|msg|text)\s+(.+?)\s+(.+?)\s+(?:on\s+)?(?:whatsapp|whtsap|watsap|\bwp\b)', msg_clean)
        # Pattern 6: open whatsapp/wp and say/send/msg <message> to <contact>
        m_wa6 = re.search(r'(?:open|opn)\s+(?:whatsapp|whtsap|watsap|\bwp\b)\s+(?:and\s+)?(?:say|send|message|msg)\s+(.+?)\s+to\s+(.+)', msg_clean)

        wa_contact = None
        wa_msg = None

        if m_wa1:
            wa_msg = m_wa1.group(1).strip()
            wa_contact = m_wa1.group(2).strip()
        elif m_wa2:
            wa_msg = m_wa2.group(1).strip()
            wa_contact = m_wa2.group(2).strip()
        elif m_wa4:
            wa_contact = m_wa4.group(1).strip()
            wa_msg = m_wa4.group(2).strip()
        elif m_wa6:
            wa_msg = m_wa6.group(1).strip()
            wa_contact = m_wa6.group(2).strip()
        elif m_wa5:
            wa_contact = m_wa5.group(1).strip()
            wa_msg = m_wa5.group(2).strip()
        elif m_wa3:
            wa_contact = m_wa3.group(1).strip()
            wa_msg = m_wa3.group(2).strip()

        if wa_contact and wa_msg:
            from app.routers.device import send_whatsapp_message, WhatsAppMessageRequest
            wa_res = await send_whatsapp_message(WhatsAppMessageRequest(contact=wa_contact, message=wa_msg))
            reply_text = (
                f"💬 **WhatsApp Auto-Dispatch:**\n\n"
                f"Opening WhatsApp and searching for **{wa_contact.title()}** to send:\n"
                f"> *\"{wa_msg}\"*\n\n"
                f"✨ Auto-targeted WhatsApp App & Web! If web is not signed in, the app takes over automatically.\n\n"
                f"👉 [**📲 Open in WhatsApp Desktop App**]({wa_res.get('app_url', 'whatsapp://')}) • [**🌐 Open in WhatsApp Web**]({wa_res.get('web_url', 'https://web.whatsapp.com')})"
            )
            provider_used = "WhatsApp Automation Engine"

    # -------------------------------------------------------------
    # INTENT 2: Mobile / System Calling App ("call dad", "call 9876543210", "call mom")
    # -------------------------------------------------------------
    if not reply_text and not re.search(r'whatsapp|whtsap|watsap|\bwp\b', msg_clean):
        call_match = re.search(
            r'^(?:(?:can\s+u|can\s+you|plz|please)\s+)?(?:call|phone|dial|phone\s+call|ring)\s+(?:to\s+)?(.+?)(?:\s+(?:on\s+mobile|on\s+phone|now|plz|karo))?$',
            msg_clean
        )
        if call_match:
            phone_target = call_match.group(1).strip()
            # Exclude if target is a common phrase (false positive guard)
            if phone_target not in ["it a day", "it off", "me later", "back", "someone", "anyone"]:
                from app.routers.device import trigger_mobile_phone_call, PhoneCallRequest
                c_res = await trigger_mobile_phone_call(PhoneCallRequest(target=phone_target))
                reply_text = (
                    f"📞 **Phone Calling Engine:**\n\n"
                    f"Initiating call to **{phone_target.title()}** on your device.\n\n"
                    f"👉 [**TAP HERE TO CALL {phone_target.upper()} (Opens Calling App)**]({c_res.get('tel_uri')})"
                )
                provider_used = "Mobile Calling Engine"

    # -------------------------------------------------------------
    # INTENT 3: Chained Open & Write Commands ("open notepad and write hello world", "opn notepd and writ...")
    # -------------------------------------------------------------
    if not reply_text:
        write_match = re.search(
            r'^(?:(?:can\s+u|can\s+you|plz|please)\s+)?(?:open|opn)\s+(notepad|notepd|wordpad|pad|notpad)\s+(?:and\s+)?(?:write|writ|type|likho)\s+(.+)$',
            msg_clean
        )
        if write_match:
            target_app = write_match.group(1).strip()
            text_to_write = write_match.group(2).strip()
            from app.routers.device import open_and_write_note, OpenAndWriteRequest
            w_res = await open_and_write_note(OpenAndWriteRequest(app_name=target_app, content=text_to_write))
            reply_text = (
                f"📝 **Note Auto-Writer:**\n\n"
                f"Opened **{target_app.title()}** on your screen with your text ready:\n\n"
                f"```text\n{text_to_write}\n```"
            )
            provider_used = "Desktop Action Engine"

    # -------------------------------------------------------------
    # INTENT 4: Open Application, Website, Folder, or System Protocol
    # Handles: "open youtube", "open youtube for me", "can you open notepad",
    #          "launch chrome", "play lofi on youtube", "open downloads", etc.
    # -------------------------------------------------------------
    # Check for direct "play ... on youtube" in English, broken English, and Hinglish
    if not reply_text:
        yt_play_match = re.search(
            r'^(?:(?:can\s+u|cn\s+u|can\s+you|could\s+you|bhai|please|plz|pls|plez)\s+)*(?:play|search|chalu\s+karo|shuru\s+karo)\s+(.+?)\s+(?:on|in|pe|par)\s+(?:youtube|utube|yt)$',
            msg_clean
        )
        if yt_play_match:
            from app.routers.device import open_application, OpenAppRequest
            yt_query = yt_play_match.group(1).strip()
            app_res = await open_application(OpenAppRequest(app_name=f"youtube {yt_query}"))
            reply_text = f"🎵 Opening YouTube to play **\"{yt_query}\"** for you in your browser right now!"
            provider_used = "Neural Action Engine"

    # Check for general "open / launch / start / run / show / kholo / chalu karo" commands
    if not reply_text:
        open_match = re.search(
            r'^(?:(?:can\s+u|cn\s+u|can\s+you|could\s+you|bhai|please|plz|pls|plez)\s+)*(?:open|opn|opne|lanch|lunch|start|stat|run|play|kholo|chalu\s+karo|shuru\s+karo|show|bring\s+up)\s+(?:up\s+)?(?:the\s+)?(.+?)(?:\s+(?:kholo|chalu\s+karo|shuru\s+karo|kardo|kr\s+do|for\s+me|please|plz|pls|now|bhai))?$',
            msg_clean
        )
        if open_match:
            candidate = open_match.group(1).strip()
            # Exclude if candidate is asking a general question like "open source software" or "open mind"
            if candidate not in ["source", "source software", "ai", "mind", "heart", "eyes", "code"]:
                from app.routers.device import open_application, OpenAppRequest
                app_res = await open_application(OpenAppRequest(app_name=candidate))
                if app_res.get("success"):
                    msg = app_res.get("message", f"Opened {candidate.title()}")
                    reply_text = f"✨ {msg} for you right now."
                    provider_used = "Neural Action Engine"
                else:
                    reply_text = f"Attempted to launch **{candidate}**, but system reported: {app_res.get('error', 'App not found locally')}"
                    provider_used = "Neural Action Engine"

    # -------------------------------------------------------------
    # INTENT 5: Live Web Search ("search for latest news", "google python", "look up...")
    # -------------------------------------------------------------
    if not reply_text:
        search_match = re.search(r'^(?:please\s+)?(?:search(?:\s+for)?|look\s+up|google)\s+(.+)$', msg_clean)
        if search_match:
            search_query = search_match.group(1).strip()
            from app.routers.device import web_search, SearchRequest
            s_res = await web_search(SearchRequest(query=search_query, max_results=3))
            results = s_res.get("results", [])
            if results:
                summary_lines = [f"- **[{r['title']}]({r['url']})**: {r['snippet']}" for r in results]
                reply_text = f"Here is what I found for **\"{search_query}\"**:\n\n" + "\n\n".join(summary_lines)
                provider_used = "Live Web Search"

    # -------------------------------------------------------------
    # INTENT 6: Device Location Radar
    # -------------------------------------------------------------
    if not reply_text:
        if any(w in msg_clean for w in ["where am i", "current location", "what is my location", "show my location"]):
            from app.routers.device import resolve_location, LocationRequest
            loc_res = await resolve_location(LocationRequest())
            if not loc_res.get("error"):
                reply_text = (
                    f"**Current Device Location Detected:**\n\n"
                    f"📍 **City/Region:** {loc_res.get('city')}, {loc_res.get('region') or loc_res.get('state')} ({loc_res.get('country')})\n"
                    f"🌐 **Coordinates:** Lat `{loc_res.get('latitude')}`, Lon `{loc_res.get('longitude')}`\n"
                    f"🗺️ [Open in Google Maps]({loc_res.get('map_url')})"
                )
                provider_used = "GeoLocation Radar"

    # -------------------------------------------------------------
    # AI INFERENCE: Context-Aware Ollama Local LLM
    # (Only runs if no direct system action intent handled the command!)
    # -------------------------------------------------------------
    if not reply_text and settings.AI_PROVIDER == "ollama":
        try:
            # Build conversation history prompt so the model remembers past turns (Auto-Train Memory)
            conversation_history_text = ""
            for pm in past_messages[-10:]:
                role_label = "User" if pm.role == "user" else "EL"
                conversation_history_text += f"{role_label}: {pm.content}\n"

            full_prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"### Conversation History:\n"
                f"{conversation_history_text}"
                f"User: {req.message}\n"
                f"EL:"
            )

            ollama_timeout = httpx.Timeout(connect=2.0, read=40.0, write=5.0, pool=2.0)
            async with httpx.AsyncClient(timeout=ollama_timeout) as client:
                res = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": full_prompt,
                        "stream": False
                    }
                )
                if res.status_code == 200:
                    reply_text = res.json().get("response", "").strip()
                    provider_used = f"Ollama ({settings.OLLAMA_MODEL})"
        except Exception:
            pass

    # -------------------------------------------------------------
    # AI INFERENCE: Cloud LLM Fallback (OpenAI / Gemini / Anthropic compatible)
    # -------------------------------------------------------------
    if not reply_text and settings.CLOUD_API_KEY and settings.CLOUD_API_KEY != "your_actual_api_key_here":
        try:
            messages_payload = [{"role": "system", "content": SYSTEM_PROMPT}]
            for pm in past_messages[-10:]:
                messages_payload.append({"role": pm.role, "content": pm.content})
            messages_payload.append({"role": "user", "content": req.message})

            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(
                    f"{settings.CLOUD_BASE_URL}/chat/completions",
                    headers={"Authorization": f"Bearer {settings.CLOUD_API_KEY}"},
                    json={
                        "model": settings.CLOUD_MODEL,
                        "messages": messages_payload
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    reply_text = data["choices"][0]["message"]["content"]
                    provider_used = f"Cloud ({settings.CLOUD_MODEL})"
        except Exception:
            pass

    # -------------------------------------------------------------
    # FALLBACK: Built-in Neural Emotive Engine with Poetry & Emotion
    # -------------------------------------------------------------
    if not reply_text:
        reply_text = generate_neural_fallback(req.message, past_messages)
        provider_used = "EL Neural Emotive Core"

    # Store assistant message
    asst_msg = Message(conversation_id=conv_id, role="assistant", content=reply_text)
    db.add(asst_msg)
    await db.commit()

    return ChatResponse(
        reply=reply_text,
        conversation_id=conv_id,
        provider_used=provider_used
    )

# -------------------------------------------------------------
# Conversation Management Endpoints (Chat History)
# -------------------------------------------------------------
@router.get("/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    """List all saved conversations sorted by most recently updated."""
    result = await db.execute(
        select(Conversation).order_by(Conversation.updated_at.desc(), Conversation.id.desc()).limit(50)
    )
    convs = result.scalars().all()
    output = []
    for c in convs:
        # Get count of messages and latest message snippet
        msg_res = await db.execute(
            select(Message).where(Message.conversation_id == c.id).order_by(Message.id.desc()).limit(1)
        )
        last_m = msg_res.scalar_one_or_none()
        output.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else "",
            "updated_at": c.updated_at.isoformat() if c.updated_at else "",
            "last_snippet": (last_m.content[:50] + "...") if last_m else "Empty session"
        })
    return output

@router.post("/conversations")
async def create_conversation(db: AsyncSession = Depends(get_db)):
    """Create a new chat conversation session."""
    conv = Conversation(title="New Neural Session")
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return {"id": conv.id, "title": conv.title}

@router.get("/conversations/{conversation_id}")
async def get_conversation_details(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch all messages for a specific conversation session."""
    conv = await db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.id.asc())
    )
    messages = result.scalars().all()
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else "",
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.strftime("%I:%M %p") if m.timestamp else ""
            }
            for m in messages
        ]
    }

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a conversation and all its associated messages."""
    await db.execute(delete(Message).where(Message.conversation_id == conversation_id))
    await db.execute(delete(Conversation).where(Conversation.id == conversation_id))
    await db.commit()
    return {"success": True, "message": "Conversation deleted successfully"}

@router.get("/history/{conversation_id}")
async def get_history(conversation_id: int, db: AsyncSession = Depends(get_db)):
    """Legacy endpoint for backward compatibility."""
    result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id).order_by(Message.id.asc())
    )
    messages = result.scalars().all()
    return [{"id": m.id, "role": m.role, "content": m.content, "timestamp": m.timestamp} for m in messages]
