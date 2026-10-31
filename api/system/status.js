// Vercel Serverless Function: /api/system/status
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'healthy',
    mode: 'Vercel Serverless Cloud',
    ai_engine: {
      provider: 'cloud_edge',
      ollama_online: false,
      cloud_ready: true
    },
    version: '2.0.0-cloud'
  });
}
