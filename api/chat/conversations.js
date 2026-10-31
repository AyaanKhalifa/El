// Vercel Serverless Function: /api/chat/conversations
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      id: Date.now(),
      title: 'New Neural Session'
    });
  }

  // GET: return default session
  res.status(200).json([
    {
      id: 1,
      title: 'Current Session',
      updated_at: new Date().toISOString(),
      last_snippet: 'Cloud Session Active'
    }
  ]);
}
